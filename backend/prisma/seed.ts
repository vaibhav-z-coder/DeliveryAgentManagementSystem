import { PrismaClient, AgentStatus } from '@prisma/client';

const prisma = new PrismaClient();

const sampleAgents = [
  {
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@deliverypro.io',
    serviceArea: 'Indiranagar, Bangalore',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Electric Scooter (Ather 450X)',
    vehicleNumber: 'KA-01-EQ-1029',
  },
  {
    fullName: 'Priya Patel',
    phone: '+91 98234 56789',
    email: 'priya.patel@deliverypro.io',
    serviceArea: 'Koramangala, Bangalore',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Motorcycle (Hero Splendor)',
    vehicleNumber: 'KA-05-MK-4421',
  },
  {
    fullName: 'Amit Verma',
    phone: '+91 91234 56780',
    email: 'amit.verma@deliverypro.io',
    serviceArea: 'Whitefield, Bangalore',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Scooter (TVS Jupiter)',
    vehicleNumber: 'KA-03-JJ-8832',
  },
  {
    fullName: 'Sneha Kulkarni',
    phone: '+91 97654 32109',
    email: 'sneha.k@deliverypro.io',
    serviceArea: 'Bandra West, Mumbai',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Electric Scooter (Ola S1 Pro)',
    vehicleNumber: 'MH-02-EL-5512',
  },
  {
    fullName: 'Rohan Gupta',
    phone: '+91 94567 89012',
    email: 'rohan.gupta@deliverypro.io',
    serviceArea: 'Andheri East, Mumbai',
    status: AgentStatus.INACTIVE,
    vehicleType: 'Motorcycle (Bajaj Pulsar 150)',
    vehicleNumber: 'MH-03-BP-7741',
  },
  {
    fullName: 'Ananya Roy',
    phone: '+91 98301 23456',
    email: 'ananya.roy@deliverypro.io',
    serviceArea: 'Salt Lake, Kolkata',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Scooter (Honda Activa 6G)',
    vehicleNumber: 'WB-02-HA-9090',
  },
  {
    fullName: 'Vikram Singh Rathore',
    phone: '+91 99280 12345',
    email: 'vikram.singh@deliverypro.io',
    serviceArea: 'Connaught Place, New Delhi',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Motorcycle (Royal Enfield Hunter)',
    vehicleNumber: 'DL-01-RE-3301',
  },
  {
    fullName: 'Deepak Nair',
    phone: '+91 94471 23456',
    email: 'deepak.nair@deliverypro.io',
    serviceArea: 'HSR Layout, Bangalore',
    status: AgentStatus.INACTIVE,
    vehicleType: 'Electric Van (Tata Ace EV)',
    vehicleNumber: 'KA-51-EV-2045',
  },
  {
    fullName: 'Neha Deshmukh',
    phone: '+91 98811 23456',
    email: 'neha.deshmukh@deliverypro.io',
    serviceArea: 'Kothrud, Pune',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Scooter (Suzuki Access 125)',
    vehicleNumber: 'MH-12-SA-6611',
  },
  {
    fullName: 'Karthik Raja',
    phone: '+91 98401 23456',
    email: 'karthik.raja@deliverypro.io',
    serviceArea: 'T. Nagar, Chennai',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Motorcycle (Yamaha FZ-S)',
    vehicleNumber: 'TN-01-YF-4589',
  },
  {
    fullName: 'Farhan Ali',
    phone: '+91 93501 23456',
    email: 'farhan.ali@deliverypro.io',
    serviceArea: 'Cyber City, Gurgaon',
    status: AgentStatus.ACTIVE,
    vehicleType: 'Electric Scooter (Chetak EV)',
    vehicleNumber: 'HR-26-CK-1122',
  },
  {
    fullName: 'Meera Iyer',
    phone: '+91 94441 23456',
    email: 'meera.iyer@deliverypro.io',
    serviceArea: 'Adyar, Chennai',
    status: AgentStatus.INACTIVE,
    vehicleType: 'Scooter (Honda Activa 125)',
    vehicleNumber: 'TN-07-HA-7733',
  },
];

async function main() {
  console.log('🌱 Seeding delivery agents...');

  for (const agent of sampleAgents) {
    await prisma.agent.upsert({
      where: { email: agent.email },
      update: agent,
      create: agent,
    });
  }

  const count = await prisma.agent.count();
  console.log(`✅ Seed completed! Total agents in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
