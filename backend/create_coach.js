const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chelsynew72_db_user:ckG7jFGDaTCXoKN8@cluster0.pd8kors.mongodb.net/?appName=Cluster0').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }));
  const Coach = mongoose.model('Coach', new mongoose.Schema({}, { strict: false }), 'coaches');
  
  const user = await User.findOne({ email: 'coach@test1.com' });
  console.log('User:', user?._id, user?.email);
  
  const existing = await Coach.findOne({ userId: user._id });
  console.log('Existing coach profile:', existing?._id);
  
  if (!existing) {
    const profile = await Coach.create({
      userId: user._id,
      bio: 'Experienced fitness coach specializing in strength and conditioning.',
      specialties: ['strength', 'conditioning', 'weight loss'],
      monthlyRate: 99,
      experience: 5,
      clients: [],
      rating: 4.8,
      totalReviews: 0,
      isActive: true,
    });
    console.log('Created coach profile:', profile._id);
  } else {
    console.log('Profile already exists');
  }
  
  mongoose.disconnect();
});
