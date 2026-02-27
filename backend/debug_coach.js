const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chelsynew72_db_user:ckG7jFGDaTCXoKN8@cluster0.pd8kors.mongodb.net/?appName=Cluster0').then(async () => {
  const Coach = mongoose.model('Coach', new mongoose.Schema({}, { strict: false }), 'coaches');
  const Plan = mongoose.model('Plan', new mongoose.Schema({}, { strict: false }), 'plans');
  
  const userId = '699c6f43108afaa862701116';
  
  const coach = await Coach.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  console.log('Coach profile:', JSON.stringify(coach, null, 2));
  
  const plans = await Plan.find({ coachId: new mongoose.Types.ObjectId(userId) });
  console.log('Plans count:', plans.length);
  
  mongoose.disconnect();
});
