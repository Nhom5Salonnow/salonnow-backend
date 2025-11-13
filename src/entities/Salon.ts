import { Entity, Property, Opt, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Salon {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  @Property()
  name: string;

  @Property({ nullable: true })
  address?: string;

  constructor(name: string, address?: string) {
    this.name = name;
    this.address = address;
  }
}
