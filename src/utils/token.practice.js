// import jwt from "jsonwebtoken";

// class TokenService {
//   constructor() {
//     (this.secret = process.env.JWT_TOKEN), (this.expiresIn = "1h");
//   }

//   generate(userId) {
//     return jwt.sign({ userId }, this.secret, { expiresIn: this.expiresIn });
//   }

//   verify(token) {
//     return jwt.verify(token, this.secret);
//   }
// }

// export default TokenService

import jwt from "jsonwebtoken";

class NeedToken {
  constructor() {
    (this.secret = process.env.JWT_TOKEN), (this.expiresIn = "1h");
  }
  generate(user_id) {
    return jwt.sign({ user_id }, this.secret, { expiresIn: this.expiresIn });
  }
  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

export default NeedToken