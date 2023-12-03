import { handler } from "../lambda/importFileParser";
import { S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";

describe("Given the importFileParser handler", () => {

  const event = {
    Records: [
      {
        s3: {
          bucket: {
            name: "bucket-name"
          },
          object: {
            key: "object-key"
          }
        },
      },
    ],
  } as any;

  const consoleSpy = jest.spyOn(global.console, 'log')
  beforeEach(() => {
    consoleSpy.mockClear()
  })

  it("has to mock s3", async () => {
    mockClient(S3Client);

    await handler(event);

    expect(console.log).toHaveBeenCalledWith(event);
  });

});

