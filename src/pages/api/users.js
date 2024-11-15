import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {

    const newUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };
    return res.status(200).json(newUser);

  } else if (req.method === 'PUT') {
    const { name, email } = req.body;
    const user = await prisma.user.create({
      data: { name, email },
    });

    return res.status(201).json(user);
  } else if (req.method === 'GET') {
    const { page = 1, limit = 10 } = req.query;
      
  const pageInt = parseInt(page, 10);
  const limitInt = parseInt(limit, 10);

  
  if (isNaN(pageInt) || isNaN(limitInt) || pageInt < 1 || limitInt < 1) {
    return res.status(400).json({ error: 'Invalid page or limit' });
  }

  const users = await prisma.user.findMany({
    skip: (pageInt - 1) * limitInt,
    take: limitInt,
  });

  const total = await prisma.user.count();

  return res.status(200).json({
    users,
    total,
    page: pageInt,
    limit: limitInt,


    // const users = await prisma.user.findMany({
    //   skip: (page - 1) * parseInt(limit),
    //   take: parseInt(limit),
    // });
    
    // const total = await prisma.user.count();
    // return res.status(200).json({ users, total });
  });
  }
}
