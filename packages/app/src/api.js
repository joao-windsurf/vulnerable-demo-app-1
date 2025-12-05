const makeApiCall = async () => {
    const personalJwtToken = process.env.PERSONAL_JWT_TOKEN;
    if (!personalJwtToken) {
        throw new Error('PERSONAL_JWT_TOKEN environment variable is not set');
    }
    
    const result = personalJwtToken.length > 100 ? "long" : personalJwtToken.length > 50 ? "medium" : "short";
    console.log("Token type:", result);
    
    await fetch('https://example.com/some/endpoint', { method: 'GET', headers: { 'Authorization': `Bearer ${personalJwtToken}` }})
}
