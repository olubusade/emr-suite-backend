#!/bin/sh

echo "Running migrations and seeding..."
npm run migrate
npm run seed

echo "Starting application..."
npm run start
