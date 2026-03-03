const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chelsynew72_db_user:ckG7jFGDaTCXoKN8@cluster0.pd8kors.mongodb.net/?appName=Cluster0').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Sub = mongoose.model('Sub', new mongoose.Schema({}, { strict: false }), 'subscriptions');
  
  const user = await User.findOne({ name: /tem/i });
  console.log('User:', user?._id, user?.name, user?.email);
  
  if (user) {
    const sub = await Sub.findOne({ clientId: user._id });
    console.log('Subscription:', sub ? JSON.stringify(sub) : 'NONE');
  }
  
  mongoose.disconnect();
});
