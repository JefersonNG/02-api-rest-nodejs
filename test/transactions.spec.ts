import { it, beforeAll, afterAll, describe, expect, beforeEach } from "vitest" 
import { app } from "../src/app"
import request from "supertest"
import { execSync } from "child_process"

describe('Transactions routes', () => {
  
  beforeAll( async () => {
    await app.ready()
  })

  afterAll( async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })


  it("should be able to user can create new transaction", async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Transaction de test',
        amount: 1000,
        type: 'credit'
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {

    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'Transaction de test',
      amount: 1000,
      type: 'credit'
    })

    const cookies = createTransactionResponse.header['set-cookie']

    const listTransactionsResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "Transaction de test",
        amount: 1000,
      })
    ])


  })

  it('should be able to get a specific transaction', async () => {

    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "Transaction de test",
      amount: 1000,
      type: 'credit'
    })

    const cookies = createTransactionResponse.header['set-cookie']
    

    const listTransactionsResponse = await request(app.server)
    .get('/transactions')
    .set('Cookie', cookies)
    .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const listTransactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set('Cookie', cookies)
    .expect(200)

    expect(listTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "Transaction de test",
        amount: 1000,
      })
    )
  })

  it('should be able to get a summary', async () => {

    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: "credit Transaction de test",
      amount: 1000,
      type: 'credit'
    })

    const cookies = createTransactionResponse.header['set-cookie']

    await request(app.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send({
      title: "debit Transaction de test",
      amount: 500,
      type: 'debit',
    })

    const listTransactionResponse = await request(app.server)
    .get(`/transactions/summary`)
    .set('Cookie', cookies)
    .expect(200)

    expect(listTransactionResponse.body.summary).toEqual({
      amountTotal: 500
    })
  })

})