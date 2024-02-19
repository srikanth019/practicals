let peopleArray = [
  { id: 4, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 22 },
  { id: 1, name: 'David', age: 28 },
  // Add more objects as needed
];

const id = 1;
const updatedUser = { id: 1, name: 'Sri', age: 20 };

peopleArray = peopleArray.map((user) => {
  if (user.id === id) {
    return { ...user, ...updatedUser };
  }
  return user;
});
console.log(/data/, peopleArray);
