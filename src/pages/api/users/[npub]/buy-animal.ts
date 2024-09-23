import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const { npub } = query;
  const { animal } = body;

  if (method === 'POST') {
    if (!animal) {
      return res.status(400).json({ error: 'Animal name is required' });
    }

    try {
      const { users } = await connectToDatabase();
      if (!users) {
        throw new Error('Failed to connect to the database');
      }

      // Here you might want to add logic to check if the user has enough coins to buy the animal

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

      if (result.modifiedCount === 0 && result.upsertedCount === 0) {
        return res.status(400).json({ success: false, message: "Animal already owned or user not found" });
      }

      res.status(200).json({ success: true, message: "Animal bought successfully" });
    } catch (error) {
      console.error("Error buying animal:", error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}