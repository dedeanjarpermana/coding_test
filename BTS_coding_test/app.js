const express = require('express');

const app = express()
const port = 5000
const {pool} = require("./db")
var fs = require('fs')
const { body, validationResult, check } = require('express-validator');
const session = require ('express-session')
const flash = require ('connect-flash')
const cookieParser = require('cookie-parser')
app.use(express.urlencoded({extended :true}))

// information using ejs
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));
app.use(flash())
app.use(cookieParser('secret'))
app.use(
  session({
    cookie : {maxAge : 6000},
    secret : 'secret',
    resave: true,
    saveUninitialized : true
  })
)



// halaman about
app.get('/', (req, res)=>{
  res.render('./index', {title:"index our company"})
  
});

// halaman about
app.get('/about', async (req, res) => {
  try {
      const {rows : kontak } = await pool.query(`SELECT * FROM user`)
      res.render('./about', {
          title: 'about',
          kontak
      })
  // console.log(kontak.username)
  }catch (err) {
      console.error(err.message)
  }
})

// memangggil view list dari database (assincronus)
app.get("/contact", async (req, res) => {
  try {
    const {rows : kontak } = await pool.query(`select * from user`)
      res.render ('contact', {
          kontak,
          title: "View",
          msg: req.flash('msg')
          
      })
    // console.log(kontak.username)

  }
  catch (error){
      console.error("salah")
  }
      
})


// ketika diklik di button add, direct ke form tambah
app.get('/contact/add', (req, res) => {
  res.render('add_contact', {
      title: 'New Contact',
      
  })
})

// proses insert data dan validasi
app.post('/contact',
[
  body('name').custom(async(value) => {
    
    const query_list_name =  await pool.query(`SELECT name from user where name = '${value}'`)  
    if(query_list_name.rowCount > 0) {
      throw new Error('Nama already used')
    }
    return true
  }),
  check('mobile', 'nomor tidak valid!').isMobilePhone('id-ID'),
  check('email', 'email tidak valid!').isEmail()
],
  (req, res) => {
    try{
      const err = validationResult(req)
      if(!err.isEmpty()){
        res.render('add_contact', {
          title: 'New Contact',
          err: err.array(),
        })
        req.flash('msg', 'data fail added')
        res.redirect('/contact')
      }
      else{
        const{username, password, email, phone, country, city, postcode, name, address} = req.body

        pool.query(`INSERT INTO user values('${username}','${password}','${email}', '${phone}', '${country}', '${city}', '${postcode}', '${name}', '${address}', )`)
        req.flash('msg', 'Data berhasil ditambahkan')
        res.redirect('/contact')
      }
    } 
    catch (err) {
      console.error(err.message)
  } 
  
})


//  memangggil detail view list dari database (assincronus )
// route ini tidak boleh disimpan di atas
app.get("/contact/:name", async (req, res) => {
  try {
    const name = (req.params.name)
    const {rows : kontak }  = await pool.query(`select * from contacts where name = '${name}'`)
    kontak.map(
      detailContact => 
      res.render('details', {
      title: "page detail data data ", 
      detailContact
      })
      )
  }
  catch (error){
      console.error("salah")
  }
      
})


//Proses Update Contact
app.post('/contact/update', [
  body('name').custom(async(value, {req}) => {
      const duplikat = await pool.query(`SELECT name FROM contacts WHERE name = '${value}'`)
      if(!value === req.body.oldNama && duplikat) {
          throw new Error('Nama contact sudah digunakan')
      }
      return true
  }),
  check('email', 'Email yang ada input salah').isEmail(),
  check('mobile', 'No HP yang anda input salah').isMobilePhone('id-ID')
  
], 
  async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
      res.render('edit', {
          title : 'Form Ubah Contact',
          
          errors : errors.array(),
          contactEdit : req.body,
      })
  }
  else {
      const{name, email, mobile} = req.body
      await pool.query(`UPDATE contacts SET name = '${name}', mobile = '${mobile}', email = '${email}' where name = '${req.body.oldName}' `)
      req.flash('msg', 'Data contact berhasil di Update')
      res.redirect('/contact')
  }
})


// Untuk route Edit Contact by Name
app.get('/contact/edit/:name', async (req, res) => {
  try{
      const name = (req.params.name)
      const {rows : contact} = await pool.query(`SELECT name, email, mobile FROM contacts WHERE name = '${name}'`)
      contact.map(contactEdit => {
          res.render('edit', {
              title : "Page Contact Detail",
              contactEdit
          })
      })
  }
  catch (err) {
      console.error(err.message)
  }
  
})


// Route Contact Delete By Name
app.get('/contact/delete/:name', async (req, res) => {
  try {
      const deleteContact = await pool.query(`DELETE FROM contacts WHERE name = '${req.params.name}'`)
      if(!deleteContact) {
          req.flash('msg', 'Data contact gagal di hapus')
          res.redirect('/contact')
      }
      else {
          req.flash('msg', 'Data contact berhasil di hapus')
          res.redirect('/contact')
      }
  }
  catch(err){
      console.error(err.message)
  }
})

// halaman about
app.get('/about', (req, res)=>{
  res.render('./about', {title:"about our company"})
  // res.sendFile('./about.html', {root:__dirname})
  //res.send('hellooo post about')
});

app.use('/', (req, res) => {
  res.status(404)
  // res.send('page not found 404')
})



app.listen(port, () => {
  
  console.log(`Example app listening on port http://localhost:${port}/`)
})