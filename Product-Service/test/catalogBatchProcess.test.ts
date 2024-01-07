import { handler } from '../lambda/catalogBatchProcess';

describe('catalogBatchProcess lambda is covered by unit tests:', () => {
  it('should return 200', async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            title: 'title',
            description: 'description',
            price: 7,
            count: 13,
          }),
        },
      ],
    };
    const result = await handler(event);

    expect(result?.statusCode).toEqual(200);
  });

  it('should return 400', async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            title: 'title',
            description: 'description',
            price: 5,
          }),
        },
      ],
    };
    const result = await handler(event);

    expect(result?.statusCode).toEqual(400);
  });
});

