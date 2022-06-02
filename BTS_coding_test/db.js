
const Pool = require ('pg').Pool
const pool = new Pool({
    user:"postgres",
    password:"gadissuci25",
    database:'shoppingdb',
    host:"localhost", 
    port: 5432
})




// proses add kontak dengan database
const prosesAddContact =  async (req, res) => {
    res.render('add_contact',{
        title: "Add Contact",
        
    })
}

const addContact = async (req, res) => {
    try {
        const {rows: insert_contacts_query} = await pool.query(`INSERT INTO user (username, password, email, phone, country, city,postcode, name, address) VALUES ('${req.params.username}', '${req.params.password}', '${req.params.email}', '${req.params.phone}', '${req.params.country}',  '${req.params.city}',  '${req.params.postcode}', '${req.params.name}', '${req.params.address}'    `);
        add_contacts_query(
            addContact => 
            res.render('./add_contact', {
                title: "Add data ", 
                addContact
        })
        )
    console.log(insert_contacts_query)
    }
    catch (error)
    {
        console.error(error.message)
    }
};
        
const delContact =  async (req, res) => {
    try {
        const {rows: del_contacts_query} = await pool.query(`DELETE user WHERE id = '${req.params.id}'`)
        
    }
    catch (error)
    {
        console.error(error.message)
    }
}
        
module.exports = {pool,
                delContact,
                addContact , 
                prosesAddContact,
            }