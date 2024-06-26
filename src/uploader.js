import multer from 'multer'

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,`./src/public/images`)
    },
    filename: function(req,file,cb){
        cb(null,`${Date.now()}`)
    }
})

const uploader = multer({storage})