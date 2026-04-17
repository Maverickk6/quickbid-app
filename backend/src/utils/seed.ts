import { prisma } from '../db/prisma';
import { faker } from '@faker-js/faker';

const CATEGORIES = [
  'Electronics', 'Collectibles', 'Fashion', 'Home', 'Sports', 
  'Art', 'Jewelry', 'Books', 'Vehicles', 'Other'
];

async function seed() {
  console.log('Seeding database...');
  
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Creating test users...');
  
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() => 
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: 'hashed-password-placeholder',
          name: faker.person.fullName(),
        },
      })
    )
  );
  
  console.log(`Created ${users.length} users`);
  console.log('Creating 500 auctions...');
  
  const auctions = await Promise.all(
    Array.from({ length: 500 }).map((_, i) => {
      const startingPrice = parseFloat(faker.commerce.price({ min: 10, max: 10000 }));
      const daysFromNow = faker.number.int({ min: -7, max: 30 });
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + daysFromNow);
      
      const isEnded = daysFromNow < 0;
      const isActive = daysFromNow > 0;
      
      return prisma.auction.create({
        data: {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice,
          currentPrice: startingPrice,
          minIncrement: faker.number.float({ min: 1, max: 50, fractionDigits: 2 }),
          endTime,
          status: isEnded ? 'ENDED' : isActive ? 'ACTIVE' : 'ACTIVE',
          category: faker.helpers.arrayElement(CATEGORIES),
          creatorId: faker.helpers.arrayElement(users).id,
        },
      });
    })
  );
  
  console.log(`Created ${auctions.length} auctions`);
  console.log('Adding bids to some auctions...');
  
  const auctionsWithBids = faker.helpers.arrayElements(auctions, Math.floor(auctions.length * 0.3));
  let totalBids = 0;
  
  for (const auction of auctionsWithBids) {
    const numBids = faker.number.int({ min: 1, max: 10 });
    let currentPrice = auction.startingPrice;
    
    for (let i = 0; i < numBids; i++) {
      const bidder = faker.helpers.arrayElement(users);
      const increment = faker.number.float({ 
        min: auction.minIncrement, 
        max: auction.minIncrement * 5,
        fractionDigits: 2 
      });
      const bidAmount = parseFloat((currentPrice + increment).toFixed(2));
      
      await prisma.bid.create({
        data: {
          amount: bidAmount,
          isWinning: i === numBids - 1,
          userId: bidder.id,
          auctionId: auction.id,
        },
      });
      
      currentPrice = bidAmount;
      totalBids++;
    }
    
    await prisma.auction.update({
      where: { id: auction.id },
      data: { currentPrice },
    });
  }
  
  console.log(`Created ${totalBids} bids`);
  console.log('Seeding complete!');
  console.log('');
  console.log('Summary:');
  console.log(`- ${users.length} users`);
  console.log(`- ${auctions.length} auctions`);
  console.log(`- ${totalBids} bids`);
  console.log(`- ${auctionsWithBids.length} auctions with bids`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
