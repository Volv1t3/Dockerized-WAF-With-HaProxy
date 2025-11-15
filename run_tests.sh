#!/bin/bash

# Test cases
declare -a urls=(
    "http://localhost:8080/"
    "http://localhost:8080/search?q=<script>alert(1)</script>"
    "http://localhost:8080/search?q=1%20UNION%20SELECT%201,2,3"
    "http://localhost:8080/submit"
)

declare -a expected_status_codes=(
    200
    403
    403
    403
)

declare -a post_data=(
    ""
    ""
    ""
    "{\"comment\":\"1 OR 1=1\"}"
)

declare -a test_names=(
    "Test 1: Benign request"
    "Test 2: XSS attack"
    "Test 3: SQLi attack"
    "Test 4: SQLi attack in POST request"
)

passed_tests=0
total_tests=${#urls[@]}

for i in "${!urls[@]}"; do
    url=${urls[$i]}
    expected_status=${expected_status_codes[$i]}
    test_name=${test_names[$i]}
    post_data=${post_data[$i]}

    echo "Running test: $test_name"

    if [ -z "$post_data" ]; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$post_data" "$url")
    fi

    if [ "$status_code" -eq "$expected_status" ]; then
        echo "  [PASS] Expected status code $expected_status, got $status_code"
        passed_tests=$((passed_tests + 1))
    else
        echo "  [FAIL] Expected status code $expected_status, got $status_code"
    fi
done

echo ""
echo "--- Test Results ---"
echo "Passed: $passed_tests / $total_tests"
echo "--------------------"
