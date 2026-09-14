import { useState } from 'react';

function Signup() {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // stops the page from reloading (default form behavior)
    console.log({ name });
    // later: send this to your backend's /api/auth/login endpoint
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;