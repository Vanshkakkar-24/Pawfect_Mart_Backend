import User from "../models/user.js";

/* GET all addresses */
export const getAddresses = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json(user.addresses);
};

/* ADD new address */
export const addAddress = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user.addresses.length === 0) {
        req.body.isDefault = true;
    }
    if (user.addresses.length === 0) {
        req.body.isDefault = true;
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
};

/* UPDATE address */
export const updateAddress = async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }

    if (req.body.isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
    }

    Object.assign(address, req.body);
    await user.save();
    res.json(user.addresses);
};

/* DELETE address */
export const deleteAddress = async (req, res) => {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
        (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json(user.addresses);
};
