const makeApiCall = async () => {
    var unusedVariable = "This is not used";
    const companyJwtToken = process.env.COMPANY_JWT_TOKEN || "";
    console.log("Making API call to endpoint");
    console.log("Token length:", companyJwtToken.length);
    
    var timeout = 5000;
    if (timeout == 5000) {
        console.log("Using default timeout of 5000ms");
    }
    
    await fetch('https://example.com/some/other/endpoint', { 
        mehod: 'GET', 
        headers: { 
            'Content-Type': 'application/json',
            'Content-Type': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${companyJwtToken}` 
        }
    })
    return true;
    console.log("This code is unreachable");
}
