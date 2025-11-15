import { MikroORM } from '@mikro-orm/core';
import { Test } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from '../../mikro-orm.config';
import { Salon } from '../../entities/Salon';
import { SalonController } from './salon.controller';

describe('salon controller', () => {

  let salonController: SalonController;
  let orm: MikroORM;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          ...config, // never move this line under any other line

          dbName: 'mobile-demo-testing',
          allowGlobalContext: true,
        }),
        MikroOrmModule.forFeature({ entities: [Salon] }),
      ],
      controllers: [SalonController],
    }).compile();

    salonController = module.get(SalonController);
    orm = module.get(MikroORM);
    await orm.getSchemaGenerator().refreshDatabase();
  });

  afterAll(async () => await orm.close(true));

  it(`CRUD`, async () => {
    const res1 = await salonController.create({ name: 's1', address: '123 Main St' });
    expect(res1.id).toBeDefined();
    expect(res1.name).toBe('s1');
    expect(res1.address).toBe('123 Main St');

    const id = res1.id;

    const res2 = await salonController.find();
    expect(res2).toHaveLength(1);
    expect(res2[0].id).toBeDefined();
    expect(res2[0].name).toBe('s1');
    expect(res2[0].address).toBe('123 Main St');

    const res3 = await salonController.update(id, { name: 's2' });
    expect(res3.id).toBeDefined();
    expect(res3.name).toBe('s2');
    expect(res3.address).toBe('123 Main St');
  });
});
