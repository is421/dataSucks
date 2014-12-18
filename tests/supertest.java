import java.util.*;
import java.io.*;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.Select;


public class supertest {
	
	static String baseUrl="http://localhost";
	static WebDriver driver = new FirefoxDriver();
	static List<String> accounts;
	
	public static void main(String[] args) throws IOException {
		 BufferedReader file = new BufferedReader(new FileReader("config.txt"));
		 accounts = new ArrayList<String>();
		 String line =null;
		 while((line=file.readLine())!=null){
//			 System.out.println(line);
			 accounts.add(line.replaceAll("\"", ""));
		 }

		 mainLogin(accounts.get(0), accounts.get(1));
		 imap(accounts.get(2), accounts.get(3), accounts.get(4));
		 fb(accounts.get(5), accounts.get(6));
		 twit(accounts.get(7), accounts.get(8));

	}
	
	public static void mainLogin(String name, String pass) {
		String baseUrl="http://localhost";
		
		driver.get(baseUrl);
		WebElement username = driver.findElement(By.name("username"));
		WebElement password = driver.findElement(By.name("password"));
		WebElement btn = driver.findElement(By.cssSelector("input[value=\"Signin\"]"));

		//Enter and submit user info
		username.sendKeys(name);
		password.sendKeys(pass);
		btn.submit();
		
		if(driver.getCurrentUrl().equals("localhost")){
			System.exit(0);
		}
	}
	
	public static void imap(String host, String name, String pass){
		driver.get(baseUrl + "/dashboard");
	     Select dropHost = new Select(driver.findElement(By.name("host")));
	     dropHost.selectByVisibleText(host);
	        
	     WebElement username = driver.findElement(By.name("username"));
	     WebElement password = driver.findElement(By.name("password"));
	     WebElement btn = driver.findElement(By.cssSelector("input[value=\"Link\"]"));
	        
	     username.sendKeys(name);
	     password.sendKeys(pass);
	     btn.submit();
	        
//	     driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);     
	     if(driver.findElements(By.cssSelector(".alert.alert-danger")).size() != 0){
	          System.out.println(driver.findElement(By.cssSelector(".alert.alert-danger")).getText());
	     } else {
	          System.out.println(driver.findElement(By.cssSelector(".alert.alert-success")).getText() + " of " + host + " account");
	     }
		
	}
	
	public static void fb(String name, String pass){
		 driver.get(baseUrl + "/dashboard");
		 
	     WebElement fbBtn = driver.findElement(By.cssSelector("a[href=\"/auth/facebook\"]"));
	     fbBtn.click();
	     
		 WebElement username = driver.findElement(By.cssSelector("input[class=\"inputtext\"]"));
	     WebElement password = driver.findElement(By.cssSelector("input[class=\"inputpassword\"]"));
	     WebElement loginbtn  = driver.findElement(By.cssSelector("input[value=\"Log In\"]"));
	     username.sendKeys(name);
	     password.sendKeys(pass);
	     loginbtn.click();
	        
	     if(driver.findElements(By.cssSelector("div[class=\"pam login_error_box uiBoxRed\"]")).size() != 0){
	        System.out.println(driver.findElement(By.cssSelector("div[class=\"pam login_error_box uiBoxRed\"]")).getText());
	     } else {
	        WebElement okay = driver.findElement(By.cssSelector("button[name=\"__CONFIRM__\"]"));
	        okay.submit();
	        System.out.println("Success!");
	     }
		
	}
	
	public static void twit(String name, String pass){
		driver.get(baseUrl + "/dashboard");
        WebElement twitBtn = driver.findElement(By.cssSelector("a[href=\"/auth/twitter\"]"));
        
        twitBtn.click();
        
        
        
        WebElement username = driver.findElement(By.cssSelector("input[class=\"text\"]"));
        WebElement password = driver.findElement(By.cssSelector("input[class=\"password text\"]"));
        WebElement signin  = driver.findElement(By.cssSelector("input[class=\"submit button selected\"]"));
        username.sendKeys(name);
        password.sendKeys(pass);
        signin.submit();
        
        if(driver.findElements(By.cssSelector("span[class=\"message-text\"]")).size() != 0){
        	System.out.println(driver.findElement(By.cssSelector("span[class=\"message-text\"]")).getText());
        } else {
        	WebElement authorize = driver.findElement(By.cssSelector("input[value=\"Authorize app\"]"));
        	authorize.click();
        	System.out.println("Success!");
        }
//        String text = driver.findElement(By.cssSelector("span[class=\"message-text\"]")).getText();
//        System.out.println(text);
        
        driver.close();		
		
	}
	

}
