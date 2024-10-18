// Wrapper function for async handling
const asyncHandler=(requestHandler)=>{
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=>next(err))
    }
}

export {asyncHandler}

// const asyncHandler=(requestHandler)=> async ()=>{
//     try {
//         await requestHandler(req,res,next)
//     }
//     catch(error){
//         req.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// }