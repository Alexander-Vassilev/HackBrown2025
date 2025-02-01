import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://jkdya16z5b.execute-api.us-east-2.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: req.body.name,
          description: req.body.description,
        }),
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error calling Lambda function' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
