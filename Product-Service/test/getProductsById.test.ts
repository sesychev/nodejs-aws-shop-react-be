import { handler } from "../lambda/getProductsById";

describe("Given getProductsById handler", () => {
  it("should return correct result", async () => {
    const id = {
      pathParameters: {
        productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      },
    };
    const result = await handler(id);
    //console.log(id.pathParameters.productId)
    //console.log(result.body)
    expect(result.statusCode).toEqual(200)
  });

  it("should return correct result", async () => {
    const id = {
      pathParameters: {
        productId: "7567ec4b-b10c-48c5-9345-fc73c48a80a",
      },
    };
    const result = await handler(id);
    //console.log(id.pathParameters.productId)
    //console.log(result.body)
    expect(result.statusCode).toEqual(404)
  });
});