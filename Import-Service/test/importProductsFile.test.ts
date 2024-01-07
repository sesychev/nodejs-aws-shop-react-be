import { handler } from "../lambda/importProductsFile";

describe("Given the importProductsFile handler", () => {
	it("should get correct Signed URL", async () => {
		const input = {
			queryStringParameters: {
				name: 'fake.csv',
			}
		}
		const result = await handler(input);
		expect(result.statusCode).toEqual(200)
	});

	it("should throw error", async () => {
		const input = {
			queryStringParameters: {
				name: 'fake.cs',
			}
		}
		const result = await handler(input);
		expect(result.statusCode).toEqual(400)
	});
});
