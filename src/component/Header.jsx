import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'

const Header = (props) =>{
  const {
    handleClickCartOffcanvas,
    offcanvasCartRef,
    handleCloseCartOffcanvas,
    cart,
    toPay,
    getCartItemsQty,
    deleteCartItem,
    handleReduceCartQty,
    handleCartQtyInputOnChange,
    handleCartQtyInputOnBlur,
    handleAddCartQty,
    setToPay,
    handleDeleteCartAll,
    formCart,
    showErrorToast,
    showSuccessToast,
    getCart,
    addOffcanvasCartRef,
    BASE_URL,
    PATH,
    axios
  }=props

  const {
    register,
    handleSubmit,
    formState:{ errors },
    reset
  } = useForm({
    defaultValues:{
      email:'@gmail.com'
    },
    mode: "onChange"
  })

  const onSubmit = (data) => {
    const {message,...user} = data
    postOrder(user,message)
  }

  // 送出訂單
  async function postOrder(user,message) {
    try {
      await axios.post(`${BASE_URL}/v2/api/${PATH}/order`,{data:{
        user,
        message
      }})
      reset()
      getCart()
      setToPay(false)
      addOffcanvasCartRef.current.hide()
      showSuccessToast('訂單成功送出')
    } catch (error) {
      showErrorToast(error?.response?.data?.message)
    }
  } 


  return(<>
        <header className="fixed-top bg-white container p-3">
        <div className="row">
          <div className="col-3">
            <h1 className="h3">眼鏡店</h1>
          </div>
          <div className="col-9 d-flex justify-content-end align-items-center">
            <button className="btn btn-outline-primary position-relative" type="button" onClick={handleClickCartOffcanvas}>
              <i className="bi bi-bag me-2"></i>
              <span>購物車</span>
                {
                  cart?.carts?.length > 0
                  ?
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    { cart?.carts?.reduce((total, item)=> total+item.qty, 0) }
                    <span className="visually-hidden">購物車數量</span>
                  </span>
                  :
                  ""
                }
            </button>

            <div className="offcanvas offcanvas-end cart-offcanvas" tabIndex="-1" ref={offcanvasCartRef}>
              <div className="offcanvas-header">
                <h5 className="offcanvas-title">購物車</h5>
                <button type="button" className="btn-close" onClick={handleCloseCartOffcanvas} ></button>
              </div>
              <div className="offcanvas-body">
                {
                  toPay 
                  ?
                  <div>
                    <div className="card">
                      <div className="card-body">
                        <table className="table mb-5">
                          <thead>
                            <tr>
                              <th scope="col">商品名稱</th>
                              <th scope="col"  className="text-center">單價</th>
                              <th scope="col" className="text-center">數量/單位</th>
                              <th scope="col" className="text-center">價格</th>
                            </tr>
                          </thead>
                          <tbody >
                          { cart.carts?.map((item)=>(
                              <tr key={item.product.id}>
                                <td className="align-content-center " style={{width:"300px"}}>{item.product.title}</td>
                                <td className="align-content-center" style={{width:"90px"}}>
                                  <div className="d-flex justify-content-end">
                                  <span className="text-secondary">$ {item.product.price}</span>
                                  </div>
                                </td>
                                <td className="align-content-center">
                                  <span className="me-2 d-flex align-items-center ">
                                    {getCartItemsQty(item)}
                                    <span className="ms-1">{item.product.unit}</span>
                                  </span>
                                </td>
                                <td className="align-content-center" style={{width:"100px"}}>
                                  <div className="d-flex justify-content-end">
                                    <span className="text-danger" >$ {item.final_total}</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          }
                            <tr>
                              <td></td>
                              <td></td>
                              <td className="align-content-center">總價</td>
                              <td className="align-content-center">
                                <div className="d-flex justify-content-end text-danger fw-bold">
                                  $ {cart?.final_total}
                                </div>
                                </td>
                            </tr>
                          </tbody>
                        </table>
                        <h5 className="card-title  mb-2">訂購資訊</h5>
                        <div className="card-text">
                          <form onSubmit={handleSubmit(onSubmit)} >
                            <div className="row">
                              <div className="col-6 mb-3 ">
                                <div className="form-floating ">
                                  <input type="text" className={`form-control  ${errors["name"] && "is-invalid"}`} id="name" placeholder="name" {...register("name",{
                                    required:"欄位必填",
                                  })} />
                                  <span className="invalid-feedback">{errors.name ? errors.name.message : ""}</span>
                                  <label htmlFor="name">訂購人姓名</label>
                                </div>
                              </div>

                              <div className="col-6 mb-3 ">
                                <div className="form-floating">
                                  <input type="tel" className={`form-control  ${errors["tel"] && "is-invalid"}`} id="tel" placeholder="tel" {...register("tel",{
                                    required:"欄位必填",
                                    pattern:{
                                      value:/^[0-9]{10}$/,
                                      message:"請輸入有效的手機"
                                    }
                                  })} />
                                  <span className="invalid-feedback">{errors.tel ? errors.tel.message : ""}</span>
                                  <label htmlFor="tel">訂購人手機</label>
                                </div>
                              </div>

                              <div className="col-12 mb-3 ">
                                <div className="form-floating">
                                  <input type="email" className={`form-control  ${errors["email"] && "is-invalid"}`} id="email" placeholder="email" {...register("email", {
                                    required: "欄位必填",
                                    pattern:{
                                      value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                      message:"請輸入有效的 email 格式"
                                    }
                                  })}  />
                                  <span className="invalid-feedback">{errors.email? errors.email.message : ""}</span>
                                  <label htmlFor="email">訂購人email</label>
                                </div>
                              </div>

                              <div className="col-12 mb-3 ">
                                <div className="form-floating">
                                  <input type="text" className={`form-control  ${errors["address"] && "is-invalid"}`} id="address" placeholder="address" {...register("address",{
                                    required:"欄位必填",
                                  })}  />
                                  <span className="invalid-feedback">{errors.address ? errors.address.message : ""}</span>
                                  <label htmlFor="address">訂購人地址</label>
                                </div>
                              </div>

                              <div className="col-12 mb-3 ">
                                <div className="form-floating">
                                  <textarea type="text" className={`form-control  ${errors["message"] && "is-invalid"}`} id="message" placeholder="message" style={{height:"100px"}} {...register("message",{
                                    maxLength:{
                                      value:100,
                                      message:"字數不能超過100字"
                                    }
                                  })}  />
                                  <span className="invalid-feedback">{errors.message ? errors.message.message : ""}</span>
                                  <label htmlFor="message">如有特殊需求，請這邊填寫（字數限制100字）</label>
                                </div>
                              </div>

                              <div className="col-12">
                                <button
                                  type="submit"
                                  className={`btn btn-sm btn-primary w-100 mb-2 mt-2 ${cart?.carts?.length === 0 ? "disabled" : ""}`}
                                >送出訂單</button>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-secondary w-100"
                                  onClick={()=>setToPay(false)}
                                >返回商品編緝</button>
                            </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                    
                  :
                  <div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col">商品名稱</th>
                          <th scope="col">數量/單位</th>
                          <th scope="col" className="text-center">單價</th>
                          <th scope="col">庫存</th>
                          <th scope="col" className="text-center">價格</th>
                        </tr>
                      </thead>
                      <tbody >

                      { cart.carts?.map((item)=>(
                        <tr key={item.product.id}>
                          <td className="align-content-center">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger"
                              onClick={()=>deleteCartItem(item.id)}
                              >X</button>
                          </td>
                          <td className="align-content-center " style={{width:"200px"}}>{item.product.title}</td>
                          <td className="align-content-center  ">
                            <span className="me-2 d-flex align-items-center ">
                              <button 
                                type="button"
                                className={`btn btn-sm btn-outline-primary`}
                                onClick={()=>handleReduceCartQty(item,formCart)}
                              >-</button>
                              <input
                                type="text"
                                className="form-control cart-number-input text-center "
                                value={getCartItemsQty(item)}
                                onChange={(e) => handleCartQtyInputOnChange(e,item,formCart)} 
                                onBlur={(e)=>{handleCartQtyInputOnBlur(e,item,true,null)}}
                              />
                              <button
                                type="button"
                                className={`btn btn-sm btn-outline-primary`}
                                onClick={()=>handleAddCartQty(item,formCart)}
                              >+</button>
                              <span className="ms-1">{item.product.unit}</span>
                            </span>
                          </td>
                          <td className="align-content-center" >
                            <div className="d-flex justify-content-end">
                              <span className="text-secondary " style={{width:"70px"}}>$ {item.product.price}</span>
                            </div>
                          </td>
                          <td className="align-content-center">
                            <span className="d-flex text-secondary " style={{width:"45px"}}>{item.product.stockQty}</span>
                          </td>
                          <td className="align-content-center" style={{width:"100px"}}>
                            <div className="d-flex justify-content-end">
                              <span className="text-danger text-end" >$ {item.final_total}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td className="align-content-center">總價</td>
                          <td className="align-content-center">
                            <div className="d-flex justify-content-end text-danger fw-bold">
                              $ {cart?.final_total}
                            </div>
                          </td>
                        
                        </tr>
                      </tbody>
                    </table>

                    <button 
                      type="button" 
                      className={`btn btn-sm btn-primary w-100 mb-2 mt-5 ${cart?.carts?.length === 0 ? "disabled" : ""}`}
                      onClick={()=>setToPay(true)}
                    >去買單</button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={handleDeleteCartAll}
                    >清空購物車</button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </header>
  </>)
}

export default Header
