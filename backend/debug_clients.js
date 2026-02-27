const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chelsynew72_db_user:ckG7jFGDaTCXoKN8@cluster0.pd8kors.mongodb.net/?appName=Cluster0').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  
  const clientIds = [
    '699c6878304d38f1e5612d36',
    '699d6e6e640e1580bb859dfa',
    '69a04de5c3617ff8497d3055'
  ];
  
  for (const id of clientIds) {
    const user = await User.findById(id);
    console.log(id, '->', user ? user.email : 'NOT FOUND');
  }
  
  mongoose.disconnect();
});
