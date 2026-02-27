const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chelsynew72_db_user:ckG7jFGDaTCXoKN8@cluster0.pd8kors.mongodb.net/?appName=Cluster0').then(async () => {
  const Plan = mongoose.model('Plan', new mongoose.Schema({}, { strict: false }), 'plans');
  
  const plans = await Plan.find({ coachId: new mongoose.Types.ObjectId('699c6f43108afaa862701116') });
  plans.forEach(p => console.log(p._id, p.title, 'isTemplate:', p.isTemplate));
  
  mongoose.disconnect();
});
