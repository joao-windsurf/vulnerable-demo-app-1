const makeApiCall = async () => {
    const companyJwtToken = process.env.COMPANY_JWT_TOKEN;
    if (!companyJwtToken) {
        throw new Error("COMPANY_JWT_TOKEN environment variable is not set");
    }

    const timeout = 5000;

    const response = await fetch('https://example.com/some/other/endpoint', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${companyJwtToken}`
        }
    });
    return response.ok;
}
