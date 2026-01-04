import jwt from "jsonwebtoken";

class generateToken {
  constructor() {
    (this.secret = process.env.JWT_TOKEN), (this.expiresIn = "1h");
  }
  generate(userId) {
    return jwt.sign({ userId }, this.secret, { expiresIn: this.expiresIn });
  }
  verify(token){
    return jwt.verify(token, this.secret)
  }
}
export default new generateToken()