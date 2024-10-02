import os

# Corrected mapping of current file names to appropriate ones from the course outline
file_mapping = {
    'DHCP Configuration.mp4': 'Expert Guide to Configuring DHCP Server in pfSense.mp4',
    'DHCP Static Mapping.mp4': 'Implementing DHCP Static Mapping in pfSense.mp4',
    'dns advance.mp4': 'Advanced DNS Configuration in pfSense.mp4',
    'DNS Settings in pfSense.mp4': 'Managing DNS Servers in pfSense.mp4',
    'end.mp4': 'Final Words and Conclusion.mp4',  # Adjusted title for the end
    'Essential Tools and Resources for the Course.mp4': 'Essential Tools and Resources for the Course.mp4',
    'Exploring the Features and Capabilities of pfSense.mp4': 'Exploring the Features and Capabilities of pfSense.mp4',
    'Firewall Rule - Port Forwarding.mp4': 'Mastering NAT and Port Forwarding in pfSense.mp4',
    'Firewall Section.mp4': 'Introduction to pfSense Firewall Concepts.mp4',
    'FW Alias.mp4': 'Simplifying Firewall Rules with Aliases in pfSense.mp4',
    'FW Intro with diagram.mp4': 'Understanding Firewall Basics with Diagrams.mp4',
    'FW Rule using Aliases.mp4': 'Streamlining Rule Creation with Firewall Aliases.mp4',
    'FW Rule.mp4': 'Configuring Firewall Rules in pfSense.mp4',
    'FW Schedule Rule.mp4': 'Implementing Scheduled Firewall Rules in pfSense.mp4',
    'FW Schedule.mp4': 'Managing Firewall Rules with Schedules in pfSense.mp4',
    'intiial config command line.mp4': 'pfSense Command Line Initial Configuration.mp4',
    'Introduction to Proxmox.mp4': 'Introduction to Proxmox Virtualization.mp4',
    'ipclass.mp4': 'Understanding IP Address Classes.mp4',
    'Maximizing Your Learning Experience.mp4': 'Maximizing Your Learning Experience in pfSense.mp4',
    'OpenVPN Configuration in pfSense.mov': 'Setting Up OpenVPN in pfSense.mov',
    'packages in pfsense.mov': 'Installing Packages in pfSense.mov',
    'pfsense - firewall rule on schedule.mov': 'Creating Firewall Rules on Schedule in pfSense.mov',
    'pfsense alias.mov': 'Managing Aliases in pfSense.mov',
    'pfsense backup restore.mov': 'Backup and Restore in pfSense.mov',
    'pfsense firewall schedule.mov': 'Creating Firewall Schedules in pfSense.mov',
    'pfsense intro.mp4': 'Introduction to pfSense on VirtualBox.mp4',
    'pfSense Introduction __ NGFW Review.mp4': 'Introduction to pfSense NGFW Review.mp4',
    'pfsense on Proxmox.mp4': 'Installing pfSense on Proxmox.mp4',
    'pfsense open vpn server configuration.mp4': 'Setting Up OpenVPN Server in pfSense.mp4',
    'pfsense pia-003.mp4': 'Extending PIA VPN to Entire Network in pfSense.mp4',
    'pfsense section backup restore configuration.mov': 'Backup and Restore Configuration in pfSense.mov',
    'pfsense web config initial on hardware appliance.mp4': 'Initial Web Config on pfSense Hardware Appliance.mp4',
    'pfSnse HW Install.mp4': 'Installing pfSense on Dedicated Hardware.mp4',
    'pia intro.mp4': 'Introduction to Private Internet Access (PIA) VPN.mp4',
    'Portfoarwding in pfsense and using nginx.mp4': 'Configuring Port Forwarding and Nginx in pfSense.mp4',
    'Thank you end.mp4': 'Thank You and Final Thoughts.mp4',
    'Understanding the Importance of Network Security.mp4': 'Why Network Security Matters.mp4',
    'VLAN DIAGRAM.mp4': 'VLAN Configuration Diagrams Explained.mp4',
    'VLAN Section Introduction.mp4': 'Introduction to VLANs in pfSense.mp4',
    'vlan setup final.mp4': 'Final VLAN Setup in pfSense.mp4',
    'vpn pia.mp4': 'Configuring PIA VPN in pfSense.mp4',
    'VPN Sectgion.mp4': 'Introduction to VPN Section in pfSense.mp4',
    'Welcome to Pfsense Master Class.mp4': 'Welcome to pfSense Master Class.mp4',
    'WHAT IS DHCP.mp4': 'Understanding DHCP in Networking.mp4'
}

# Define the directory where the video files are located
video_directory = r"D:\ResearchAndDevelopment\Development\adobeExtendedScripting\sarthak\source\videos"

# Rename the files
for old_name, new_name in file_mapping.items():
    # Generate the full path for old and new file names
    old_file = os.path.join(video_directory, old_name)
    new_file = os.path.join(video_directory, new_name)
    
    # Check if the old file exists before renaming
    if os.path.exists(old_file):
        print(f"Renaming '{old_name}' to '{new_name}'")
        os.rename(old_file, new_file)
    else:
        print(f"File '{old_name}' not found! Skipping...")

print("Renaming complete!")
