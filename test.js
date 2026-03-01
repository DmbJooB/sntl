const u = { id: 1, name: null, email: undefined };
const mapped = {
    name: u.name || 'Inconnu',
    email: u.email || 'user@example.com',
    ...u
};
console.log(mapped);
