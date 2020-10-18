const express = require("express") //include library express
const models = require("../models/index") //include library database sequelize model melalui file index
const product = models.product //memanggil models product
const app = express()

//include library untuk mengupload data berupa file
const multer = require("multer")
const path = require("path")
const fs = require("fs")


//KONFIGURASI STORAGE IMAGE
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null,"./image/product")
    },
    filename:(req, file, cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})


//END POINT MENAMPILKAN SELURUH DATA PRODUCT
app.get("/", (req,res)=>{
    product.findAll()
    .then(product => {
        res.json({
            data:product
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//ENDPOINT TAMBAH DATA PRODUCT
app.post ("/", upload.single("image"),(req,res)=>{
    if(!req.file) {
        res.json({
            message: "no uploaded image"
        })
    }else {
        let data = {
            name:req.body.name,
            price:req.body.price,
            stock:req.body.stock,
            image: req.file.filename
        }

        product.create(data)
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
    let param = {id_product: req.body.id_product}
    let data = {
        name:req.body.name,
        price:req.body.phone,
        stock:req.body.address,
    }

    if(req.file){
        //mengambil data lama yang sesuai dengan parameter
        const row = product.findOne({where:param})
        .then(result=>{
            //mengambil nama image
            let oldFileName = result.image

            //menghapus gambar lama
            let dir = path.join(__dirname, "../image/product",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error=> {
            console.log(error.message)
        })

        //dapatkan file gambar baru
        data.image = req.file.filename

        product.update(data, ({where:param}))
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
app.delete("/:id_product", async (req,res)=>{
    try{
        let param = {id_product: req.params.id_product}
        //dapatkan data yang akan dihapus
        let result = await product.findOne({where: param})
        //temukan file gambar
        let oldFileName = result.image

        //delete file gambar lama
        let dir = path.join(__dirname,"../image/product",oldFileName)
        fs.unlink(dir,err=> console.log(err))

        //hapus data dari tabel
        product.destroy({where:param})
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