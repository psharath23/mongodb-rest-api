import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb'
const app = express();
app.use(bodyParser.json())

const API_URL = "/api"
const MONGO_URL = "mongodb://localhost:27017"

const withDB = async (operations,res) => {
    try {
        const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
        const db = client.db("my-blog")

        await operations(db)


        client.close()
    } catch (err) {
        res.status(500).json({ message: "error while fetching article", err: err })
    }
}

app.get(`${API_URL}/articles/:name`, async (req, res) => {

    withDB(async (db) => {
        const { name } = req.params
        const articleInfo = await db.collection("articles").findOne({ name })
        res.status(200).json(articleInfo)
    },res)


})

app.post(`${API_URL}/articles/:name/upvote`, async (req, res) => {
    withDB(async (db) => {
        const { name } = req.params
        await db.collection("articles").updateOne({ name }, {
            $inc: {
                upvotes: 1,
            }
        })
        const updatedArticleInfo = await db.collection("articles").findOne({ name })
        res.status(200).json(updatedArticleInfo)
    },res)

})

app.post(`${API_URL}/articles/:name/add-comment`, async (req, res) => {
    withDB(async (db) => {
        const { name } = req.params
        const comment = req.body
        await db.collection("articles").updateOne({ name }, {
            $push: {
                comments: comment,
            }
        })
        const updatedArticleInfo = await db.collection("articles").findOne({ name })
        res.status(200).json(updatedArticleInfo)
    },res)

})



app.listen(8000, () => {
    console.log("app is listening on port 8000")
})

