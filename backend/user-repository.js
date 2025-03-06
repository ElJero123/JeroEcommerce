import { ADMIN_USERNAME1, ADMIN_USERNAME2, configDB } from './config.js'
import { parseProduct, parseUser } from './user-schema.js'
import bcrypt from 'bcrypt'
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection(configDB)

export class UserRepository {
  static async login ({ username, password }) {
    parseUser({ username, password })

    const [user] = await connection.query(`
      SELECT BIN_TO_UUID(id) id, username, password, role FROM users WHERE username = ?
    `, [username])

    if (user.length === 0) throw new Error('User not found')

    const isValidPassword = await bcrypt.compare(password, user[0].password)
    if (!isValidPassword) throw new Error('Invalid password')

    const publicUser = {
      id: user[0].id,
      username: user[0].username,
      role: user[0].role
    }

    return publicUser
  }

  static async register ({ username, password }) {
    const result = parseUser({ username, password })

    const [user] = await connection.query(`
      SELECT BIN_TO_UUID(id) id, username, password, role FROM users WHERE username = ?
    `, [username])

    if (user.length > 0) throw new Error('User already exists')

    const hashPassword = await bcrypt.hash(password, 10)

    if (username === ADMIN_USERNAME1 || username === ADMIN_USERNAME2) {
      await connection.query(`
        INSERT INTO users (username, password, role) VALUES (?, ?, 'admin');
      `, [result.data.username, hashPassword])
    } else {
      await connection.query(`
        INSERT INTO users (username, password) VALUES (?, ?);
      `, [result.data.username, hashPassword])
    }
    return { id: user.id }
  }

  static async getProducts () {
    const [result] = await connection.query(`
      SELECT product_id, 
      url_img, price, stock, name, description 
      FROM products
    `)

    return result
  }

  static async giveAdmin ({ userToAdmin, userAdmin }) {
    const [user] = await connection.query(`
      SELECT role FROM users WHERE username = ?;
    `, [userToAdmin])

    const [admin] = await connection.query(`
      SELECT role FROM users WHERE username = ?;
    `, [userAdmin])

    if (admin[0].role !== 'admin') throw new Error('You are`nt admin')
    if (user[0].role === 'admin') throw new Error('User is Admin')

    await connection.query(`
      UPDATE users SET role = 'admin'
      WHERE username = ?;
    `, [userToAdmin])
  }

  static async quitAdmin ({ userToQuitAdmin, userAdmin }) {
    const [user] = await connection.query(`
      SELECT role FROM users WHERE username = ?;
    `, [userAdmin])

    const [admin] = await connection.query(`
      SELECT role FROM users WHERE username = ?;
    `, [userToQuitAdmin])

    if (userToQuitAdmin === ADMIN_USERNAME1 || userToQuitAdmin === ADMIN_USERNAME2) throw new Error('You can`t quit this user from admin')

    if (admin[0].role !== 'admin') throw new Error('You are`nt admin')
    if (user[0].role !== 'admin') throw new Error('To Quit Admin, the User must be Admin')

    await connection.query(`
        UPDATE users SET role = 'client'
        WHERE username = ?;
    `, [userToQuitAdmin])
  }

  static async quitProduct ({ id, admin }) {
    const [user] = await connection.query(`
      SELECT role FROM users WHERE username = ?;
    `, [admin])

    const [product] = await connection.query(`
      SELECT product_id FROM products WHERE product_id = ?;
    `, [id])

    if (admin !== ADMIN_USERNAME1 && admin !== ADMIN_USERNAME2) {
      const [productAdmin] = await connection.query(`
        SELECT product_id FROM products WHERE user_id IN (
          SELECT user_id FROM users WHERE username = ? OR username = ?;
        )
      `, [ADMIN_USERNAME1, ADMIN_USERNAME2])

      if (productAdmin.length > 0) throw new Error('You can`t delete this product')
    }

    if (user[0].role !== 'admin') throw new Error('You are`nt admin')
    if (product.length === 0) throw new Error('Product not found')

    await connection.query(`
      DELETE FROM products_in_cart WHERE product_id = ?;
    `, [id])

    await connection.query(`
      DELETE FROM products WHERE product_id = ?;
    `, [id])
  }

  static async deleteUser ({ user }) {
    if (user === ADMIN_USERNAME1 || user === ADMIN_USERNAME2) throw new Error('You can`t delete your account')

    await connection.query(`
      DELETE FROM products_in_cart WHERE user_id IN (
        SELECT user_id FROM users WHERE username = ?;
      )  
    `, [user])

    await connection.query(`
      DELETE FROM purchases WHERE user_id IN (
        SELECT user_id FROM users WHERE username = ?;
      )  
    `, [user])

    await connection.query(`
      DELETE FROM products WHERE user_id IN (
        SELECT user_id FROM users WHERE username = ?;
      )  
    `, [user])

    await connection.query(`
      DELETE FROM users WHERE username = ?;
    `, [user])
  }

  static async addToCart ({ id, productId }) {
    await connection.query(`
      INSERT INTO products_in_cart (product_id, user_id) VALUES (?, UUID_TO_BIN(?));
    `, [productId, id])
  }

  static async quitToCart ({ id, productId }) {
    await connection.query(`
      DELETE FROM products_in_cart WHERE product_id = ? AND user_id = UUID_TO_BIN(?);
    `, [productId, id])
  }

  static async getProductsInCart ({ id }) {
    const [result] = await connection.query(`
      SELECT product_id, url_img, price, stock, name, description
      FROM products
      WHERE product_id IN (
        SELECT product_id
        FROM products_in_cart
        WHERE user_id = UUID_TO_BIN(?)
      );
    `, [id])

    return result
  }

  static async getProductById ({ id }) {
    const [result] = await connection.query(`
      SELECT product_id, url_img, price, stock, name, description
      FROM products
      WHERE product_id = ?;
    `, [id])

    return result
  }

  static async addProduct ({ name, price, stock, urlImg, admin, adminId, description }) {
    parseProduct({ name, price, stock, urlImg, adminId, description })

    const {
      name: productName,
      price: productPrice,
      stock: productStock,
      urlImg: productUrlImg,
      adminId: productAdminId,
      description: productDescription
    } = parseProduct({ name, price, stock, urlImg, adminId, description }).data

    if (admin !== 'admin') throw new Error('You are`nt admin')

    await connection.query(`
      INSERT INTO products (name, price, stock, url_img, user_id, description) VALUES (?, ?, ?, ?, UUID_TO_BIN(?), ?);
    `, [productName, productPrice, productStock, productUrlImg, productAdminId, productDescription])
  }

  static async completedPaymentCheckout ({ productId, quantity, username, name, urlImg, city, country, address, postalCode, state, email, id, userId }) {
    await connection.query(`
      UPDATE products SET stock = stock - ? WHERE product_id = ?;
    `, [quantity, productId])

    await connection.query(`
      INSERT INTO purchases (product_id, username, stockPurchased, name_product, url_img, city, country, address, postal_code, state, email, purchase_id, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?));
    `, [productId, username, quantity, name, urlImg, city, country, address, postalCode, state, email, id, userId])

    await connection.query(`
      DELETE FROM products_in_cart WHERE user_id = UUID_TO_BIN(?);
    `, [userId])

    await connection.execute(`
      SET SQL_SAFE_UPDATES = 0;
    `)

    await connection.query(`
      DELETE FROM products_in_cart WHERE product_id IN 
      (SELECT product_id FROM products WHERE stock <= 0);
    `)

    await connection.query(`
      DELETE FROM products WHERE stock <= 0;
    `)

    await connection.execute(`
      SET SQL_SAFE_UPDATES = 1;
    `)
  }

  static async completedPaymentCheckoutCart ({ productsId, quantity, username, urlImg, name, city, country, address, postalCode, state, email, id, userId }) {
    const arrNames = name.split(', ')

    await productsId.forEach((productId, i) => {
      connection.query(`
        UPDATE products SET stock = stock - 1 WHERE product_id = ?;
      `, [productId])

      connection.query(`
        INSERT INTO purchases (product_id, username, stockPurchased, name_product, url_img, city, country, address, postal_code, state, email, purchase_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?));
      `, [productId, username, quantity, arrNames[i], urlImg, city, country, address, postalCode, state, email, id, userId])
    })

    await connection.query(`
      DELETE FROM products_in_cart WHERE user_id = UUID_TO_BIN(?);
    `, [userId])

    await connection.execute(`
      SET SQL_SAFE_UPDATES = 0;
    `)

    await connection.query(`
      DELETE FROM products_in_cart WHERE product_id IN 
      (SELECT product_id FROM products WHERE stock <= 0);
    `)

    await connection.query(`
      DELETE FROM products WHERE stock <= 0;
    `)

    await connection.execute(`
      SET SQL_SAFE_UPDATES = 1;
    `)
  }

  static async getPurchases () {
    const [result] = await connection.query(`
      SELECT product_id, username, stockPurchased, name_product, url_img, city, country, address, postal_code, state, email, purchase_id, BIN_TO_UUID(user_id) user_id, is_pending, created_at, is_delivered
      FROM purchases
    `)

    const purchases = result.map(purchase => {
      return {
        ...purchase,
        is_pending: Boolean(purchase.is_pending),
        is_delivered: Boolean(purchase.is_delivered)
      }
    })

    return purchases
  }

  static async updateIsPending ({ id, isPending }) {
    if (isPending) {
      await connection.query(`
        UPDATE purchases SET is_pending = FALSE WHERE purchase_id = ?;
      `, [id])
    } else {
      await connection.query(`
        UPDATE purchases SET is_pending = TRUE WHERE purchase_id = ?;
      `, [id])
    }
  }

  static async deletePurchase ({ id }) {
    await connection.query(`
      DELETE FROM purchases WHERE purchase_id = ?;
    `, [id])
  }

  static async getPurchasesByUser ({ id }) {
    const [result] = await connection.query(`
      SELECT product_id, username, stockPurchased, name_product, url_img, city, country, address, postal_code, state, email, purchase_id, BIN_TO_UUID(user_id) user_id, is_pending, created_at, is_delivered
      FROM purchases
      WHERE user_id = UUID_TO_BIN(?);
    `, [id])

    const purchases = result.map(purchase => {
      return {
        ...purchase,
        is_pending: Boolean(purchase.is_pending)
      }
    })

    return purchases
  }

  static async updateIsDelivered ({ id }) {
    await connection.query(`
      UPDATE purchases SET is_delivered = TRUE WHERE purchase_id = ?;
    `, [id])
  }
}
