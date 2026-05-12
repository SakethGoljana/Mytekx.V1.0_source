import Lead from '../models/lead.model.js';

const leadController = {
  createLead: async (req, res) => {
    try {
      if (!process.env.MONGODB_URI) {
        // If no DB is connected, just log it and pretend it succeeded
        console.log('Lead captured (mock):', req.body);
        return res.status(201).json({ message: 'Lead captured successfully' });
      }

      const { name, email, businessRequirement, timeline } = req.body;
      const newLead = new Lead({ name, email, businessRequirement, timeline });
      await newLead.save();

      res.status(201).json({ message: 'Lead captured successfully' });
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({ error: 'Failed to capture lead' });
    }
  }
};

export default leadController;
