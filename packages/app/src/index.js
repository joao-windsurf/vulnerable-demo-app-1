const makeApiCall = async () => {
    const companyJwtToken = process.env.COMPANY_JWT_TOKEN;
    if (!companyJwtToken) {
        throw new Error('COMPANY_JWT_TOKEN environment variable is not set');
    }
    await fetch('https://example.com/some/other/endpoint', { method: 'GET', headers: { 'Authorization': `Bearer ${companyJwtToken}` }})
}
