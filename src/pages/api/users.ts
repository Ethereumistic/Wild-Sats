// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { nostrName, npub } = req.body;

    if (!nostrName || !npub) {
      return res.status(400).json({ error: 'nostrName and npub are required' });
    }

    try {
      const { users } = await connectToDatabase();
      if (!users) {
        throw new Error('Failed to connect to the database');
      }

      const result = await users.updateOne(
        { npub },
        { 
          $set: { 
            nostrName, 
            npub,
            lastLogin: new Date()
          }, 
          $setOnInsert: { 
            characters: ['Dog'], // Default character
            inventory: [],
            createdAt: new Date()
          } 
        },
        { upsert: true }
      );
      res.status(200).json({ message: "User data updated", result });
    } catch (error) {
      console.error("Error updating user data:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}