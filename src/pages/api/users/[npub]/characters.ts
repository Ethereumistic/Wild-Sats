import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../../lib/mongodb';

function authenticateUser(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const { npub } = req.query;
  if (!npub) {
      return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use the middleware
  authenticateUser(req, res, async () => {
      const { method, query } = req;
      const { npub } = query;

  if (method === 'GET') {
    try {
      const { users } = await connectToDatabase();
      if (!users) {
        throw new Error('Failed to connect to the database');
      }
      const user = await users.findOne({ npub });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ characters: user.characters || [] });
    } catch (error) {
      console.error("Error fetching user characters:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  } else if (method === 'POST') {
    const { animal } = req.body;

    if (!animal) {
      return res.status(400).json({ error: 'Animal name is required' });
    }

    try {
      const { users } = await connectToDatabase();
      if (!users) {
        throw new Error('Failed to connect to the database');
      }
      const result = await users.updateOne(
        { npub },
        { 
          $addToSet: { characters: animal },
          $setOnInsert: { 
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      res.status(200).json({ message: "Character added", result });
    } catch (error) {
      console.error("Error updating user characters:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
});
}