const ProductCard = (props) => {
  const {
    productsList,
    handleClickProductModal,
    handleAddCartItem
  } = props
return(
  <>
    <div  className="row mt-4">
      {
        productsList.map((product)=>(
              <div className="col-3 mb-4 " key={product.id}>
                <div 
                  className="card product-card" 
                  onClick={
                    ()=>handleClickProductModal(product)
                  }>
                <img src={product.imageUrl}  className="card-img-top product-card-img position-relative"  alt="商品主圖" />
                <div className="card-body product-car-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title product-card-title h6">{product.title}</h5>
                  </div>

                  <div className="align-items-bottom">
                    <p className="card-text mb-2">
                      <span className="h4 text-danger">$ {product.price}</span>
                      <span className="text-secondary">／</span>
                      <del className="text-secondary">$ {product.origin_price}</del>
                    </p>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary w-100"
                      onClick={(e)=>{
                        e.stopPropagation()
                        handleAddCartItem(product.id,false) }
                      }>
                      加入購物車
                    </button>
                  </div>
                </div>
              </div>
            </div>
        ))
      }
    </div>
  </>
)}

export default ProductCard