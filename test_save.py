"""
Test script to verify that the /save and /check_participation endpoints work correctly.
Usage: python test_save.py [backend_url]
  backend_url defaults to http://localhost:5001
"""

import sys
import json
import urllib.request
import urllib.error

BACKEND_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5001"
TEST_PARTICIPANT_ID = "__test_participant_001__"

# Sample data mimicking what the frontend sends on completion
SAMPLE_PAYLOAD = {
    "participantId": TEST_PARTICIPANT_ID,
    "condition": "ai",
    "messages": [
        {"role": "user", "content": "What is logical reasoning?"},
        {"role": "assistant", "content": "Logical reasoning is the process of using rational thinking to analyze arguments."}
    ],
    "tasks": {
        "1": {
            "ts": 1700000000000,
            "displayIndex": 1,
            "responses": {
                "1.1": {"question": "What subject are you going to be answering questions about?", "answer": "Logical reasoning"},
                "1.2": {"question": "Which answer choice should you select?", "answer": "The best choice"}
            }
        },
        "4": {
            "ts": 1700000010000,
            "displayIndex": 4,
            "responses": {
                "4.1": {
                    "question": "Life imitates art. Which of the following, if true, most strongly supports the previous statement?",
                    "answer": "Soon after the advent of color television, white shirts became less popular as dressy attire for men, and pastel-colored shirts began to sell well."
                },
                "4.2": {"question": "How confident are you that your response is correct?", "answer": 75}
            }
        },
        "5": {
            "ts": 1700000020000,
            "displayIndex": 5,
            "responses": {
                "5.1": {
                    "question": "Federal workers receive salaries 35.5 percent higher...",
                    "answer": "Federal pay is out of line."
                },
                "5.2": {"question": "How confident are you that your response is correct?", "answer": 60}
            }
        },
        "6": {
            "ts": 1700000030000,
            "displayIndex": 6,
            "responses": {
                "6.1": {
                    "question": "No high jumper entered the track meet unless...",
                    "answer": "This is a wrong answer"
                },
                "6.2": {"question": "How confident are you that your response is correct?", "answer": 30}
            }
        }
    }
}

passed = 0
failed = 0


def post_json(path, data):
    """Send a POST request with JSON body and return (status, parsed_body)."""
    url = f"{BACKEND_URL}{path}"
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        resp = urllib.request.urlopen(req)
        return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8")) if e.read else {}
    except urllib.error.URLError as e:
        print(f"\n  FATAL: Cannot connect to {BACKEND_URL} - {e.reason}")
        print("  Make sure the backend is running (docker compose up).")
        sys.exit(1)


def test(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        print(f"  FAIL  {name}" + (f" ({detail})" if detail else ""))


print(f"Testing against: {BACKEND_URL}\n")

# ── Test 1: Save endpoint ──
print("1. Testing POST /save ...")
status, body = post_json("/save", SAMPLE_PAYLOAD)

test("Returns status 201", status == 201, f"got {status}")
test("Response has 'message' field", body.get("message") == "OK", f"got {body.get('message')}")
test("Response has 'prolificCode'", "prolificCode" in body)
test("Response has 'prolificUrl'", "prolificUrl" in body)
test("Response has 'correctAnswers'", "correctAnswers" in body)
test("Response has 'totalQuestions'", "totalQuestions" in body)

# 4.1 and 5.1 are correct, 6.1 is wrong → expect 2 correct
test("Correct answer count is 2", body.get("correctAnswers") == 2, f"got {body.get('correctAnswers')}")
test("Total questions is 20", body.get("totalQuestions") == 20, f"got {body.get('totalQuestions')}")

# ── Test 2: Check participation (should find the test participant) ──
print("\n2. Testing POST /check_participation (existing ID) ...")
status, body = post_json("/check_participation", {"id": TEST_PARTICIPANT_ID})

test("Returns status 302 for existing ID", status == 302, f"got {status}")

# ── Test 3: Check participation with unknown ID ──
print("\n3. Testing POST /check_participation (unknown ID) ...")
try:
    url = f"{BACKEND_URL}/check_participation"
    data = json.dumps({"id": "__nonexistent_id__"}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req)
    status = resp.status
except urllib.error.HTTPError as e:
    status = e.code

test("Returns status 204 for unknown ID", status == 204, f"got {status}")

# ── Test 4: Verify study_data.json was written ──
print("\n4. Checking study_data.json contents ...")
try:
    with open("study_data.json", "r") as f:
        data = json.load(f)

    test("study_data.json is a list", isinstance(data, list))

    test_records = [r for r in data if r.get("participantId") == TEST_PARTICIPANT_ID]
    test("Test record exists in file", len(test_records) > 0)

    if test_records:
        record = test_records[-1]
        test("Record has 'savedAt' timestamp", "savedAt" in record)
        test("Record has 'condition'", record.get("condition") == "ai", f"got {record.get('condition')}")
        test("Record has 'messages'", len(record.get("messages", [])) == 2, f"got {len(record.get('messages', []))}")
        test("Record has 'tasks'", len(record.get("tasks", {})) > 0)
        test("Record has 'correctAnswers'", record.get("correctAnswers") == 2, f"got {record.get('correctAnswers')}")
        test("Record has 'answerResults'", isinstance(record.get("answerResults"), dict))

        results = record.get("answerResults", {})
        test("4.1 marked correct", results.get("4.1") is True, f"got {results.get('4.1')}")
        test("5.1 marked correct", results.get("5.1") is True, f"got {results.get('5.1')}")
        test("6.1 marked incorrect", results.get("6.1") is False, f"got {results.get('6.1')}")
except FileNotFoundError:
    test("study_data.json exists", False, "file not found")
    print("  (If running remotely, this check only works on the machine hosting the backend)")

# ── Cleanup ──
print("\n5. Cleaning up test data ...")
try:
    with open("study_data.json", "r") as f:
        data = json.load(f)

    cleaned = [r for r in data if r.get("participantId") != TEST_PARTICIPANT_ID]

    with open("study_data.json", "w") as f:
        json.dump(cleaned, f, indent=2)

    removed = len(data) - len(cleaned)
    print(f"  Removed {removed} test record(s) from study_data.json")
except FileNotFoundError:
    print("  Skipped (file not found locally)")

# ── Summary ──
total = passed + failed
print(f"\n{'='*40}")
print(f"Results: {passed}/{total} passed", end="")
if failed:
    print(f", {failed} FAILED")
else:
    print(" - all good!")
sys.exit(1 if failed else 0)
