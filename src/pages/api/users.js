import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`)
    }
  })
})

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Manejo de subida de archivos
    upload.single('file')(req, {}, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error uploading file' });
      }

      const filePath = `/uploads/${req.file.filename}`;

      // Generación de un usuario con Faker
      const newUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        doc: filePath,
      };

      const user = await prisma.user.create({
        data: newUser,
      });

      return res.status(201).json({ user, message: 'File uploaded successfully' });
    }); 
  
  }else if (req.method === 'PUT') {
      const { name, email, doc } = req.body;
  
      if (!name || !email || !doc) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const user = await prisma.user.create({
        data: { name, email, doc },
      });
  
      return res.status(201).json(user);
    } 
    
    else if (req.method === 'GET') {
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


  });
  } else {
    return res.status(405).json({ error: 'Method not allowed'})
  } 

}
export const config = {
  api: {
    bodyParser: false, 
  },
};
