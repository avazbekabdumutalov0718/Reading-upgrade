"""Build the site's Speaking bank exclusively from speaking-master.md."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "speaking-master.md"
OUTPUT = ROOT / "dist"
text = SOURCE.read_text(encoding="utf-8")


def section(start, end=None):
    first = text.index(start)
    last = text.index(end, first + len(start)) if end else len(text)
    return text[first:last]


def numbered_groups(section_text, prefix="###"):
    pattern = re.compile(rf"(?m)^{re.escape(prefix)} (\d+)\. (.+)$")
    matches = list(pattern.finditer(section_text))
    return [(int(m.group(1)), m.group(2).strip(), section_text[m.end():matches[i+1].start() if i+1 < len(matches) else len(section_text)]) for i, m in enumerate(matches)]


def plain(value):
    return value.replace("**", "").strip()


def sentence_with(answer, phrase):
    clean = plain(answer).replace("\n", " ")
    for sentence in re.split(r"(?<=[.!?])\s+", clean):
        if phrase.casefold() in sentence.casefold():
            return sentence.strip()
    return ""


def cards(answer, pairs):
    result = []
    for english, uzbek in pairs:
        assert f"**{english}**" in answer, english
        result.append({"w": english, "u": uzbek, "d": "", "e": sentence_with(answer, english), "p": "", "source": "master"})
    return result


def ideas(answer):
    sentences = re.split(r"(?<=[.!?])\s+", plain(answer).replace("\n", " "))
    return [s.strip() for s in sentences if s.strip()][:2]


def part1():
    chunk = section("## Part 1\n", "## Part 2 — asosiy 59 mavzu")
    result = []
    for number, title, group in numbered_groups(chunk):
        questions = []
        for position, question, entry in numbered_groups(group, "####"):
            match = re.search(r"(?m)^\*\*Javob:\*\* (.+)$", entry)
            gloss = re.search(r"(?m)^\*\*5 ta collocation:\*\* (.+)$", entry)
            assert match and gloss, (number, position)
            answer = match.group(1).strip()
            pairs = re.findall(r"\*\*(.+?)\*\* — ([^;]+?)(?:;|\.$)", gloss.group(1))
            assert len(pairs) == 5, (number, position, pairs)
            questions.append({"q": question, "source": "Yangi Part 1", "id": f"v2-p1-{number}-{position}", "answer": answer, "ideas": ideas(answer), "cards": cards(answer, pairs), "category": title, "topic": title, "words": len(plain(answer).split())})
        result.append({"title": title, "questions": questions, "id": f"p1-t{number}", "part": 1})
    assert len(result) == 57 and sum(len(t["questions"]) for t in result) == 418
    return result


def part2():
    # First 59 cue cards belong to the original topic list. The later cards
    # correspond to individual exam sets in the supplied new Part 3 bank.
    old_map = [0,1,2,0,3,4,5,6,7,8,9,10,11,12,27,13,14,15,16,17,18,19,20,21,22,34,24,25,26,27,28,29,30,31,32,33,21,34,35,15,21,29,16,16,28,35,36,37,38,39,41,17,32,19,16,40,42,29,39]
    exam_sets = [1,62,11,15,21,57,24,26,66,28,30,41,34,36,37,39,40,44,84,63,71,65,53,61,68,72,73,74,75,76,80,81]
    assert len(old_map) == 59 and len(exam_sets) == 32
    chunk = section("## Part 2 — asosiy 59 mavzu", "## Part 3 — asosiy 45 mavzu")
    result = []
    for number, title, entry in numbered_groups(chunk):
        label, cue = title.split(" — ", 1)
        start = re.search(r"\*\*Sample answer \(~2:15[^\n]*\)\*\*\n\n", entry)
        end = re.search(r"\n\*\*10 collocations va tarjimasi\*\*", entry)
        assert start and end, number
        answer = entry[start.end():end.start()].strip()
        gloss = entry[end.end():]
        pairs = re.findall(r"(?m)^\d+\. \*\*(.+?)\*\* — (.+)$", gloss)
        assert len(pairs) == 10, (number, len(pairs))
        related = old_map[number - 1] if number <= 59 else 45 + exam_sets[number - 60] - 1
        result.append({"title": label, "questions": [{"q": cue, "source": "Yangi Part 2", "id": f"v2-p2-{number}-1", "answer": answer, "ideas": ideas(answer), "cards": cards(answer, pairs), "category": label, "topic": label, "words": len(plain(answer).split())}], "id": f"p2-t{number}", "part": 2, "relatedPart3": related})
    assert len(result) == 91
    return result


def part3():
    first = section("## Part 3 — asosiy 45 mavzu", "## Part 3 — qo‘shimcha 84 to‘plam")
    second = section("## Part 3 — qo‘shimcha 84 to‘plam")
    result = []
    groups = [(n, title, body, "Asosiy 45") for n, title, body in numbered_groups(first)]
    marker = re.compile(r"(?m)^### To‘plam (\d+) — (\d+) ta savol$")
    matches = list(marker.finditer(second))
    for i, match in enumerate(matches):
        body = second[match.end():matches[i+1].start() if i+1<len(matches) else len(second)]
        groups.append((45+int(match.group(1)), f"Imtihon to‘plami {match.group(1)}", body, "Yangi imtihon"))
    for number, title, group, source in groups:
        questions = []
        for position, question, entry in numbered_groups(group, "####"):
            match = re.search(r"(?m)^\*\*(?:Answer|Sample answer):\*\* (.+)$", entry)
            gloss = re.search(r"(?m)^\*\*Iboralar:\*\* (.+)$", entry)
            assert match and gloss, (number, position)
            answer = match.group(1).strip()
            pairs = re.findall(r"\*\*(.+?)\*\* — ([^;]+?)(?:;|\.$)", gloss.group(1))
            assert len(pairs) == 3, (number, position, pairs)
            questions.append({"q": question, "source": source, "id": f"v2-p3-{number}-{position}", "answer": answer, "ideas": ideas(answer), "cards": cards(answer, pairs), "category": title, "topic": title, "words": len(plain(answer).split())})
        result.append({"title": title, "questions": questions, "id": f"p3-t{number}", "part": 3})
    assert len(result) == 129 and sum(len(t["questions"]) for t in result) == 1029
    return result


if __name__ == "__main__":
    bank = {"part1": part1(), "part2": part2(), "part3": part3()}
    (OUTPUT / "speaking-content.json").write_text(json.dumps(bank, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    questions = {part: [{k: item[k] for k in ("title", "id", "part")} | {"questions": [{k: q[k] for k in ("q", "source", "id")} for q in item["questions"]]} for item in group] for part, group in bank.items()}
    (OUTPUT / "speaking-questions.json").write_text(json.dumps(questions, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("Speaking bank:", ", ".join(f"{part}={len(groups)} groups / {sum(len(g['questions']) for g in groups)} questions" for part, groups in bank.items()))
