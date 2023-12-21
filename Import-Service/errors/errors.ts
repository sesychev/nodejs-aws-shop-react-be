const buildResponseBody = (status: number, headers: { "Access-Control-Allow-Origin": string; "Access-Control-Allow-Headers": string; "Access-Control-Allow-Credentials": boolean; "content-type": string; }, body: string) => {
	return {
		statusCode: status,
		headers: headers,
		body: body,
	};
};

export default buildResponseBody;