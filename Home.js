
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], 
      loading: false,
      current : {},
      parents : [{
        id: 'root',
        mimeType: 'application/vnd.google-apps.folder',
        name: "Root"
      }],
      thumbnails: false
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.lastChange = 0
  }
  handleClick(item){
    var self = this
    return function(e){
      console.log(item)
      if (item.mimeType == 'application/vnd.google-apps.folder'){
        var parents=[]
        for(var i=0; i<self.state.parents.length; i++){
          if (self.state.parents[i].id==item.id){
            break;
          }
          parents.push(self.state.parents[i])
        }
        parents.push(item)
        self.setState({ data: [], current : item, parents: parents }) 
        window.setTimeout(() => {
          self.loadData()
        }, 300);
      }else{
        window.open(item.webViewLink,'preview','width=600,height=400')
        //window.open(item.webContentLink)
      }
      
    }
  }
  handleChange(event){
      //this.setState({search: event.target.value});
  }
  handleSubmit(event){
      event.preventDefault();
      var self = this
      window.clearTimeout(this.lastChange)
      this.setState({data: []});
      this.lastChange = window.setTimeout(() => {
          self.loadData()
      }, 300);
      return false;
  }
  copyFile(id){
    var url="https://www.googleapis.com/drive/v3/files/"+ id + "/copy"
    var headers = {
      Authorization : 'Bearer ' + AUTH_TOKEN
    }
    fetch(url,{method: 'POST', headers,})
      .then(response => response.json())
      .then(data => { 
           console.log(data)
          });
  }
  loadData(){
      //AUTH_TOKEN = "ya29.GltjBlFp1_IiifotwFMgCllpXuyC9IFHLYURXTbfZcwheGTAxxmOaO-7cwU8YSRHli2NIJIT53wEPpnSMEvSDzQTVz49WJtBUREcKXSpoArztBYuhQYwP4NRoCmK"
      var headers = {
        Authorization : 'Bearer ' + AUTH_TOKEN
      }
      var parent='root'
      if (this.state.current.id){
        parent=this.state.current.id
      }
      console.log(parent, this.state.current.id, this.state.current)
      this.setState({loading: true})
      var conditions = []
      conditions.push("trashed = false")
      //conditions.push("mimeType = 'application/vnd.google-apps.folder'")
      conditions.push("'"+parent+"' in parents")
      var query=encodeURIComponent(conditions.join(" and "))
      var url = "https://www.googleapis.com/drive/v3/files?q="+ query + "&fields=files(copyRequiresWriterPermission%2CcreatedTime%2Cdescription%2CiconLink%2Cid%2Ckind%2CmimeType%2Cname%2CownedByMe%2Cparents%2Cproperties%2Cshared%2CsharingUser%2Csize%2CteamDriveId%2CthumbnailLink%2Ctrashed%2CwebContentLink%2CwebViewLink)%2CincompleteSearch%2Ckind%2CnextPageToken&key="
      //url = 'response.json'
      fetch(url,{method: 'GET', headers,})
      .then(response => response.json())
      .then(data => { 
          if (data.files){
            this.setState({ data : data.files }) 
          }
          this.setState({loading: false}) 
          });
  }
  render() {
    var self = this
    var itemComp= function(item, margin, header) {
      var style = {}
      if (header){
        style.fontWeight = 'bold'
      }
      if (margin>0){
        style.marginLeft = (margin*10) + 'px'
      }
      var img = ""
      if (item.iconLink) {
        img = <img src={item.iconLink} title={item.id} ></img>
      }
      var thumb = ""
      if (self.thumbnails && item.thumbnailLink){
        thumb = <span><br/><img src={item.thumbnailLink} title={item.id} ></img></span>
      }
      return <li style={style} key={item.id} className="collection-item" onClick={self.handleClick(item)} >
          {img} {item.name}
          {thumb}
      </li>
    }
    var cardComp= function(item, margin, header) {
      var style = {}
      if (header){
        style.fontWeight = 'bold'
      }
      if (margin>0){
        style.marginLeft = (margin*10) + 'px'
      }
      var img = ""
      if (item.iconLink) {
        img = <img src={item.iconLink} title={item.id} ></img>
      }
      var thumb = ""
      var imageStyle = {
        backgroundImage: 'url('+item.thumbnailLink+')',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        height: '160px'        
      }
      if (item.thumbnailLink){
        thumb = <div className="card-image" style={imageStyle} >
          <img src={item.thumbnailLink} title={item.id} height="160"></img>
          <span className="card-title" ></span>
        </div>
      }
      var labelStyle = {
        height: '60px',
        lineHeight: '1.1em',
        overflow: 'hidden',
        padding: '10px'
      }
      return <div key={item.id} className="col s6 m4 l3" >
            <div className="card"
             onClick={self.handleClick(item)} >
              <span>{thumb}</span>
              <div className="card-content" style={labelStyle} >
              {img} {item.name}
              </div>
            </div>
          </div>
    }
    
    const parentItems = this.state.parents.map( function(item,pos){ return itemComp(item,pos,true) });
    const listItems = this.state.data.map( function(item,pos){ return cardComp(item,self.state.parents.length,false) });
    return (
      <main >
          <div className="container">
          
          <ul className="collection">
          {parentItems}
          </ul>
          <div className="row">
          {listItems}
          </div>
          { this.state.loading ? <img width="100%" src="loading.gif" /> : null }
          </div>
      </main>  
    );
  }
  componentDidMount() {
      this.loadData()
  }
}