const express = require("express") //include library express
const models = require("../models/index") //include library database sequelize model melalui file index
const customer = models.customer //memanggil models customer
const app = express()

//include library untuk mengupload data berupa file
const multer = require("multer")
const path = require("path")
const fs = require("fs")

//AUTHENTICATION
const auth = require("../auth")
app.use(auth)

//KONFIGURASI STORAGE IMAGE
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null,"./image/customer")
    },
    filename:(req, file, cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})


//END POINT MENAMPILKAN SELURUH DATA CUSTOMER
app.get("/", (req,res)=>{
    customer.findAll()
    .then(customer => {
        res.json({
            data:customer
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//ENDPOINT TAMBAH DATA CUSTOMER
app.post ("/", upload.single("image"),(req,res)=>{
    if(!req.file) {
        res.json({
            message: "no uploaded image"
        })
    }else {
        let data = {
            name:req.body.name,
            phone:req.body.phone,
            address:req.body.address,
            image: req.file.filename
        }

        customer.create(data)
        .then(result => {
            res.json({
                message: "data has been inserted",
                data: result
            })
        })
        .catch(error=>{
            message: error.message
        })
    }
})

//END POINT EDIT DATA
app.put("/", upload.single("image"), (req,res)=>{
    let param = {id_customer: req.body.id_customer}
    let data = {
        name: req.body.name,
        phone:req.body.phone,
        address:req.body.address
    }

    if(req.file){
        //mengambil data lama yang sesuai dengan parameter
        const row = customer.findOne({where:param})
        .then(result=>{
            //mengambil nama image
            let oldFileName = result.image

            //menghapus gambar lama
            let dir = path.join(__dirname, "../image/customer",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error=> {
            console.log(error.message)
        })

        //dapatkan file gambar baru
        data.image = req.file.filename

        customer.update(data, ({where:param}))
        .then(result=> {
            res.json({
                message: "data has been updated"
            })
        })
        .catch(error=>{
            res.json({
                message: error.message
            })
        })
    }
})

//END POINT DELET DATA
app.delete("/:id_customer", async (req,res)=>{
    try{
        let param = {id_customer: req.params.id_customer}
        //dapatkan data yang akan dihapus
        let result = await customer.findOne({where: param})
        //temukan file gambar
        let oldFileName = result.image

        //delete file gambar lama
        let dir = path.join(__dirname,"../image/customer",oldFileName)
        fs.unlink(dir,err=> console.log(err))

        //hapus data dari tabel
        customer.destroy({where:param})
        .then(result=>{
            res.json({
                message:"data has been deleted"
            })
        })
        .catch(error=>{
            res.json({
                message:error.message
            })
        })


    } catch{
        res.json({
            message:error.message
        })
    }
})

module.exports = app