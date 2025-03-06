import express from 'express'
import { ACCESS_KEY, API_PRIVATE_KEY, API_WEBHOOK_KEY, PORT } from './config.js'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { UserRepository } from './user-repository.js'
import Stripe from 'stripe'

const app = express()

app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173'
}))

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const header = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, header, API_WEBHOOK_KEY)
    if (Object.keys(event.data.object.metadata).length === 0) return res.status(400).json({ message: 'No metadata' })
  } catch (e) {
    return res.status(400).json({ message: 'Webhook signature verification failed', err: e.message })
  }

  if (event.type === 'checkout.session.completed') {
    const session = JSON.parse(JSON.stringify(event.data.object))
    // console.log(session)
    const { quantity, name, image, productId, uniqueItem, userId } = session.metadata
    const { name: username, email } = session.customer_details
    const { id } = session
    const { city, country, line1, postal_code: postalCode, state } = session.customer_details.address

    const productIdParsed = JSON.parse(productId)
    const uniqueItemParsed = JSON.parse(uniqueItem)
    const imageParsed = JSON.parse(image)
    const quantityParsed = JSON.parse(quantity)

    try {
      if (uniqueItemParsed) {
        await UserRepository.completedPaymentCheckout({ productId: productIdParsed[0], quantity: quantityParsed, name, urlImg: imageParsed[0], username, city, country, postalCode, address: line1, state, email, id, userId })
        res.status(200).json({ message: `The product ${productId[0]} has been purchased!` })
      } else {
        await UserRepository.completedPaymentCheckoutCart({ productsId: productIdParsed, quantity: quantityParsed, name, urlImg: imageParsed[0], username, city, country, postalCode, address: line1, state, email, id, userId })
        res.status(200).json({ message: 'The products has been purchased!!' })
      }
    } catch (e) {
      res.status(400).json({ message: e.message })
    }

    res.status(200).end()
  }
})

app.use(express.json())

const stripe = new Stripe(API_PRIVATE_KEY)

app.post('/verify-token', async (req, res) => {
  const { token } = req.body
  try {
    jwt.verify(token, ACCESS_KEY, (err, user) => {
      if (err) throw new Error('Invalid token')

      const newAccessToken = jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role
      }, ACCESS_KEY, {
        expiresIn: '5h'
      })

      res.status(200).json({ accessToken: newAccessToken, user })
    })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const publicUser = await UserRepository.login({ username, password })

    const accessToken = jwt.sign({
      id: publicUser.id,
      username: publicUser.username,
      role: publicUser.role
    }, ACCESS_KEY, {
      expiresIn: '5h'
    })

    res.status(200).send({ publicUser, accessToken })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  try {
    const { id } = await UserRepository.register({ username, password })
    res.status(200).send(id)
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.get('/products', async (req, res) => {
  try {
    const products = await UserRepository.getProducts()
    res.json({ products })
  } catch (e) {
    res.status(500).send({ message: e.message })
  }
})

app.post('/give-admin', async (req, res) => {
  const { userAdmin, userToAdmin } = req.body

  try {
    await UserRepository.giveAdmin({ userToAdmin, userAdmin })
    res.status(200).json({ message: `The user ${userToAdmin} is admin now!` })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/quit-admin', async (req, res) => {
  const { userAdmin, userToQuitAdmin } = req.body

  try {
    await UserRepository.quitAdmin({ userToQuitAdmin, userAdmin })
    res.status(200).json({ message: `The user ${userToQuitAdmin} is client now!` })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/quit-product', async (req, res) => {
  const { id, admin } = req.body

  try {
    await UserRepository.quitProduct({ id, admin })
    res.status(200).json({ message: `The product ${id} was deleted!` })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/delete-user', async (req, res) => {
  const { user } = req.body

  try {
    await UserRepository.deleteUser({ user })
    res.status(200).json({ message: `The user ${user} was deleted!` })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/add-to-cart', async (req, res) => {
  const { id, productId } = req.body
  try {
    await UserRepository.addToCart({ id, productId })
    res.status(200).send({ message: `Product ${productId} was added to cart!` })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.post('/quit-to-cart', async (req, res) => {
  const { id, productId } = req.body
  try {
    await UserRepository.quitToCart({ id, productId })
    res.status(200).send({ message: `Product ${productId} was removed from cart!` })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.post('/products-in-cart', async (req, res) => {
  const { id } = req.body
  try {
    const products = await UserRepository.getProductsInCart({ id })
    res.status(200).send({ products })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.post('/add-product', async (req, res) => {
  const { name, price, urlImg, stock, admin, adminId, description } = req.body

  try {
    await UserRepository.addProduct({ name, price, urlImg, stock, admin, adminId, description })
    res.status(200).send({ message: 'Product added!' })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.get('/get-product/:id', async (req, res) => {
  const { id } = req.params

  try {
    const product = await UserRepository.getProductById({ id })
    res.status(200).send({ product })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.get('/get-purchased-products', async (req, res) => {
  try {
    const purchases = await UserRepository.getPurchases()
    res.status(200).json({ purchases })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/get-purchased-products-by-user', async (req, res) => {
  const { id } = req.body

  try {
    const purchases = await UserRepository.getPurchasesByUser({ id })
    res.status(200).json({ purchases })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/change-isPending-state', async (req, res) => {
  const { id, isPending } = req.body

  try {
    await UserRepository.updateIsPending({ id, isPending })
    res.status(200).json({ message: `The purchase ${id} is now ${isPending ? 'pending' : 'received'}` })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/delete-purchase', async (req, res) => {
  const { id } = req.body

  try {
    await UserRepository.deletePurchase({ id })
    res.status(200).json({ message: `The purchase ${id} was deleted!` })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/complete-delivery', async (req, res) => {
  const { id } = req.body

  try {
    await UserRepository.updateIsDelivered({ id })
    res.status(200).json({ message: `The purchase ${id} was delivered!` })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/checkout-session', async (req, res) => {
  const { name, stockToBuy, price, description, images, productId, userId } = req.body

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
              images,
              description
            },
            unit_amount: price * 100
          },
          quantity: stockToBuy
        }
      ],
      metadata: {
        productId: JSON.stringify([...productId]),
        name,
        userId,
        quantity: stockToBuy,
        image: JSON.stringify(images),
        uniqueItem: false
      },
      mode: 'payment',
      success_url: 'http://localhost:5173/success-payment',
      cancel_url: 'http://localhost:5173/cancel-payment'
    })

    res.status(200).json({ url: session.url })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.post('/checkout-session-cart', async (req, res) => {
  const { name, stockToBuy, price, description, productsId, userId, image: url } = req.body
  const image = url ? [url] : ['https://st3.depositphotos.com/1915171/18159/v/450/depositphotos_181590116-stock-illustration-shopping-cart-line-icon-sale.jpg']

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
              images: image,
              description
            },
            unit_amount: Math.floor(price * 100)
          },
          quantity: stockToBuy
        }
      ],
      metadata: {
        productId: JSON.stringify([...productsId]),
        name,
        userId,
        quantity: stockToBuy,
        image: JSON.stringify(image),
        uniqueItem: false
      },
      mode: 'payment',
      success_url: 'http://localhost:5173/success-payment',
      cancel_url: 'http://localhost:5173/cancel-payment'
    })

    res.status(200).json({ url: session.url })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
