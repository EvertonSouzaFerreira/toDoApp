let express = require('express')
let mongodb = require('mongodb')
let sanitizeHTML = require('sanitize-html')

let app = express()
let db

app.use(express.static('public'))

let connectionString = 'mongodb+srv://todoAppUser:030389@cluster0.wcein.mongodb.net/TodoApp?retryWrites=true&w=majority'
mongodb.connect(connectionString, {useNewUrlParser: true}, (err, client)=>{
  db = client.db()
  app.listen(3000)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

function passwordProtected(req, res, next) {
  res.set('www-Authenticate', 'Basic realm="Simple Todo App"')
  console.log(req.headers.authorization)
  if (req.headers.authorization == "Basic dGFza0FwcDpqYXZhc2NyaXB0"){
    next()
  }else{
    res.status(401).send("Authentication required")
  }
}

app.use(passwordProtected)
app.get('/', (req, res)=>{
  db.collection('items').find().toArray((err, items)=>{
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <!-- CSS only -->
         <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
         <link rel="stylesheet" href="style.css">
         <title>To_do_App</title>
    </head>
   
    <body>
        
        <div class="container">
            <div class="header">
                <h1 class="display-4 text-center py-1 fundo">!!Tasks for today!!</h1>
            </div>
            <div class="body">
                <div class="jumbotron p-3 shadow-sm">
                    <form id="create-form" action="/create-item" method="POST">
                      <div class="d-flex align-items-center">
                        <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                        <button class="btn btn-primary m-3">Add New Item</button>
                      </div>
                    </form>
                </div>
                <ul id="item-list" class="list-group pb-5">
                    ${items.map((item)=>{
                      return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                      <span class="item-text">${item.text}</span>
                      <div>
                        <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                        <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
                      </div>
                    </li>`
                    }).join('')}
    
            </div>
    
        </div>
                   
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script src="./script.js"></script>
    </body>
    </html>`)
  })
   
})

app.post('/create-item', (req, res)=>{
    let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
    db.collection('items').insertOne({text: safeText}, (err, info)=>{
      res.json(info.ops[0])
    })
   
})

app.post('/update-item', (req, res)=>{
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: safeText}}, ()=>{
    res.send("Success")
  })
})

app.post('/delete-item', (req, res)=>{
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, ()=>{
    res.send("Success")
  })
})