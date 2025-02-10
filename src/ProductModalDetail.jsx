const ProductModalDetail = (props) => {
  const {
    productDetailRef,
    productDetail,
    setProductDetail,
    handleReduceCartQty,
    cartQty,
    handleCartQtyInputOnChange,
    handleCartQtyInputOnBlur,
    handleAddCartQty,
    handleAddCartItem
  } = props
  return(
    <>
      <div ref={productDetailRef} className="modal fade "  tabIndex="-1">
        <div className="modal-dialog ">
          <div className="modal-content product-detail">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">{productDetail.title}</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-12 d-flex justify-content-between">
                  <div className="product-modal-secondary-img-container">
                    {Array.isArray(productDetail.imagesUrl) && productDetail?.imagesUrl.map((img)=>(
                      <div key={img} className="mb-2">
                        <img 
                          src={img}
                          alt="副圖"
                          className="product-modal-secondary-img"
                          onClick={()=>{
                            setProductDetail({
                              ...productDetail,
                              imageUrl:img
                            })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                    <img src={productDetail.imageUrl} alt="主圖" className="product-modal-primary-img" />
                  </div>
                </div>
                <div className="col-12 mt-2 d-flex align-items-center">
                  <span className="text-secondary">價格：</span>
                  <span className="text-danger me-2 fs-3">${productDetail.price}</span>
                  <del className="text-secondary fs-6">${productDetail.origin_price}</del>
                </div>
                <div className="col-12 mt-2 d-flex align-items-center">
                  <span className="text-secondary">數量：</span>
                  <span className="text-danger me-2 d-flex align-items-center ">
                    <button 
                      type="button"
                      className={`btn btn-sm btn-outline-primary`}
                      onClick={()=> handleReduceCartQty(null,null)}
                    >-</button>
                    <input
                      type="text"
                      className="form-control cart-number-input text-center "
                      value={cartQty}
                      onChange={handleCartQtyInputOnChange} 
                      onBlur={(e)=>{handleCartQtyInputOnBlur(e,null,null,productDetail)}}
                    />
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-primary`}
                      onClick={()=>handleAddCartQty(null,null,productDetail)}
                    >+</button>
                  </span>
                  <span className="text-secondary fs-6">剩下{productDetail.stockQty }個</span>
                </div>
                <div className="col-12 mt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary w-100"
                    onClick={()=>handleAddCartItem(productDetail.id) }>
                    加入購物車
                  </button>
                </div>
                <div className="col-12 mt-3">
                  <h5 className="h6 text-p">產品描述：</h5>
                  <p className="text-secondary">{productDetail.description}</p>
                  <h5 className="h6">商品說明：</h5>
                  <p className="text-secondary pre-line">{productDetail.content}</p>
                </div>
            </div>
            <div className="modal-footer">
            </div>
          </div>
        </div>
      </div>
    </>
)}

export default ProductModalDetail