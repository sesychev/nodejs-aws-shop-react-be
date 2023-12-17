import { handler } from "../lambda/getProductsList";

describe("Given the getProducts handler", () => {
  it("should return correct result", async () => {
    const result = await handler();
    //console.log(result.statusCode);
    //console.log(result.body)
    expect(result.statusCode).toEqual(200)
  });
});
