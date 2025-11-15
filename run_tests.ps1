# Test cases
$testCases = @(
    @{
        Name = "Test 1: Benign request"
        Url = "http://localhost:8080/"
        ExpectedStatusCode = 200
        Method = "GET"
        Body = $null
    }
    @{
        Name = "Test 2: XSS attack"
        Url = "http://localhost:8080/search?q=<script>alert(1)</script>"
        ExpectedStatusCode = 403
        Method = "GET"
        Body = $null
    }
    @{
        Name = "Test 3: SQLi attack"
        Url = "http://localhost:8080/search?q=1%20UNION%20SELECT%201,2,3"
        ExpectedStatusCode = 403
        Method = "GET"
        Body = $null
    }
    @{
        Name = "Test 4: SQLi attack in POST request"
        Url = "http://localhost:8080/submit"
        ExpectedStatusCode = 403
        Method = "POST"
        Body = '{"comment":"1 OR 1=1"}'
    }
)

$passedTests = 0
$totalTests = $testCases.Count

foreach ($testCase in $testCases) {
    Write-Host "Running test: $($testCase.Name)"

    try {
        $params = @{
            Uri = $testCase.Url
            Method = $testCase.Method
        }
        if ($testCase.Body) {
            $params.Body = $testCase.Body
            $params.ContentType = "application/json"
        }
        $response = Invoke-WebRequest @params -UseBasicParsing
        $statusCode = $response.StatusCode
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }

    if ($statusCode -eq $testCase.ExpectedStatusCode) {
        Write-Host "  [PASS] Expected status code $($testCase.ExpectedStatusCode), got $statusCode" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "  [FAIL] Expected status code $($testCase.ExpectedStatusCode), got $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "--- Test Results ---"
Write-Host "Passed: $passedTests / $totalTests"
Write-Host "--------------------"
